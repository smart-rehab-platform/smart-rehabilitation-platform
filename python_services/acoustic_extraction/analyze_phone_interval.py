"""
Speech Analysis V3.2.1 — acoustic feature extraction prototype.

Extracts low-level signal measurements from an already aligned phone interval.
Does NOT assess pronunciation correctness, substitutions, or diagnosis.

Isolation: python_services/acoustic_extraction/.venv
"""

from __future__ import annotations

import math
import os
import time
from pathlib import Path
from typing import Any

import numpy as np
import parselmouth
from parselmouth.praat import call

DURATION_TOLERANCE_SECONDS = 0.02
INTERVAL_TOO_SHORT_SECONDS = 0.01
PITCH_FLOOR_HZ = 75.0
PITCH_CEILING_HZ = 500.0
MIN_VOICED_PITCH_FRAMES = 2
MIN_FORMANT_FRAMES = 3
F1_RANGE_HZ = (200.0, 1200.0)
F2_RANGE_HZ = (500.0, 3500.0)

VOWEL_LIKE_PHONES = {
    "ɝ",
    "ɚ",
    "ɛ",
    "ow",
    "aa",
    "ae",
    "ah",
    "ao",
    "aw",
    "ay",
    "eh",
    "er",
    "ey",
    "ih",
    "iy",
    "uh",
    "uw",
    "a",
    "e",
    "i",
    "o",
    "u",
    "ɑ",
    "æ",
    "ɔ",
    "ɪ",
    "ʊ",
    "oʊ",
    "eɪ",
}

WARNING_MESSAGES = {
    "interval_too_short": "The aligned interval is extremely short; measurements may be unstable.",
    "interval_out_of_bounds": "The requested interval is outside the audio duration.",
    "no_voiced_pitch": "No reliable voiced pitch frames were found in this interval.",
    "insufficient_formant_frames": "Not enough valid formant frames were available for this interval.",
    "audio_load_failed": "The audio file could not be loaded for acoustic extraction.",
    "invalid_interval": "The requested interval is invalid.",
}


class AcousticExtractionError(ValueError):
    def __init__(self, code: str, message: str | None = None):
        super().__init__(message or WARNING_MESSAGES.get(code, code))
        self.code = code


def _to_finite(value: Any) -> float | None:
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(number):
        return None
    return number


def _round(value: float | None, decimals: int = 2) -> float | None:
    number = _to_finite(value)
    if number is None:
        return None
    return round(number, decimals)


def _build_warning(code: str) -> dict[str, str]:
    return {"code": code, "message": WARNING_MESSAGES.get(code, code)}


def _is_vowel_like(phone: str | None) -> bool:
    if not phone:
        return False
    return phone.strip() in VOWEL_LIKE_PHONES


def _load_sound(audio_path: str) -> parselmouth.Sound:
    path = Path(audio_path)
    if not path.is_file():
        raise AcousticExtractionError("audio_load_failed", f"Audio file not found: {audio_path}")
    try:
        return parselmouth.Sound(str(path))
    except Exception as error:
        raise AcousticExtractionError(
            "audio_load_failed",
            f"Unable to load audio: {error}",
        ) from error


def _validate_interval(start_seconds: float, end_seconds: float, audio_duration: float) -> list[dict[str, str]]:
    warnings: list[dict[str, str]] = []
    start = _to_finite(start_seconds)
    end = _to_finite(end_seconds)

    if start is None or end is None:
        raise AcousticExtractionError("invalid_interval")
    if start < 0:
        raise AcousticExtractionError("invalid_interval", "start_seconds must be >= 0")
    if end <= start:
        raise AcousticExtractionError("invalid_interval", "end_seconds must be greater than start_seconds")
    if end > audio_duration + DURATION_TOLERANCE_SECONDS:
        raise AcousticExtractionError("interval_out_of_bounds")

    duration = end - start
    if duration < INTERVAL_TOO_SHORT_SECONDS:
        warnings.append(_build_warning("interval_too_short"))
    if end > audio_duration:
        warnings.append(_build_warning("interval_out_of_bounds"))

    return warnings


def _extract_mean_f0(excerpt: parselmouth.Sound) -> tuple[float | None, int]:
    pitch = excerpt.to_pitch_ac(
        time_step=0.01,
        pitch_floor=PITCH_FLOOR_HZ,
        pitch_ceiling=PITCH_CEILING_HZ,
    )
    values = pitch.selected_array["frequency"]
    voiced = values[(values > 0) & np.isfinite(values)]
    if voiced.size < MIN_VOICED_PITCH_FRAMES:
        return None, int(voiced.size)
    return float(np.mean(voiced)), int(voiced.size)


def _extract_mean_intensity(excerpt: parselmouth.Sound) -> float | None:
    try:
        intensity = excerpt.to_intensity()
        mean_value = call(intensity, "Get mean", 0, 0, "energy")
    except Exception:
        return None
    return _to_finite(mean_value)


def _extract_formants(excerpt: parselmouth.Sound) -> tuple[float | None, float | None, int]:
    formant = excerpt.to_formant_burg(time_step=0.01, max_number_of_formants=5, maximum_formant=5500)
    times = formant.xs()
    f1_values: list[float] = []
    f2_values: list[float] = []

    for sample_time in times:
        f1 = _to_finite(formant.get_value_at_time(1, sample_time))
        f2 = _to_finite(formant.get_value_at_time(2, sample_time))
        if f1 is not None and F1_RANGE_HZ[0] <= f1 <= F1_RANGE_HZ[1]:
            f1_values.append(f1)
        if f2 is not None and F2_RANGE_HZ[0] <= f2 <= F2_RANGE_HZ[1]:
            f2_values.append(f2)

    valid_pairs = min(len(f1_values), len(f2_values))
    if valid_pairs < MIN_FORMANT_FRAMES:
        return None, None, valid_pairs

    return float(np.mean(f1_values)), float(np.mean(f2_values)), valid_pairs


def _analyze_with_sound(
    sound: parselmouth.Sound,
    start_seconds: float,
    end_seconds: float,
    phone: str | None,
    audio_path: str,
    load_ms: float,
) -> dict[str, Any]:
    started = time.perf_counter()
    warnings = _validate_interval(start_seconds, end_seconds, sound.duration)
    excerpt = sound.extract_part(
        from_time=float(start_seconds),
        to_time=float(end_seconds),
        preserve_times=False,
    )

    calc_started = time.perf_counter()
    mean_f0_hz, voiced_frames = _extract_mean_f0(excerpt)
    mean_intensity_db = _extract_mean_intensity(excerpt)

    acoustic_measurements: dict[str, Any] = {
        "mean_f0_hz": _round(mean_f0_hz, 2),
        "mean_intensity_db": _round(mean_intensity_db, 2),
    }

    if mean_f0_hz is None:
        warnings.append(_build_warning("no_voiced_pitch"))

    formants_attempted = _is_vowel_like(phone)
    if formants_attempted:
        mean_f1_hz, mean_f2_hz, formant_frames = _extract_formants(excerpt)
        if mean_f1_hz is None or mean_f2_hz is None:
            warnings.append(_build_warning("insufficient_formant_frames"))
            acoustic_measurements["mean_f1_hz"] = None
            acoustic_measurements["mean_f2_hz"] = None
        else:
            acoustic_measurements["mean_f1_hz"] = _round(mean_f1_hz, 1)
            acoustic_measurements["mean_f2_hz"] = _round(mean_f2_hz, 1)
            acoustic_measurements["formant_frame_count"] = formant_frames
    else:
        formant_frames = 0

    calc_ms = round((time.perf_counter() - calc_started) * 1000, 1)
    total_ms = round((time.perf_counter() - started) * 1000, 1)
    duration_ms = round((float(end_seconds) - float(start_seconds)) * 1000, 1)

    unique_warnings = []
    seen = set()
    for warning in warnings:
        if warning["code"] in seen:
            continue
        seen.add(warning["code"])
        unique_warnings.append(warning)

    status = "usable"
    if any(warning["code"] == "interval_too_short" for warning in unique_warnings):
        status = "usable_with_caution"
    if acoustic_measurements["mean_f0_hz"] is None and acoustic_measurements["mean_intensity_db"] is None:
        status = "limited"

    return {
        "phone": phone,
        "start_seconds": round(float(start_seconds), 3),
        "end_seconds": round(float(end_seconds), 3),
        "duration_ms": duration_ms,
        "acoustic_measurements": acoustic_measurements,
        "quality": {
            "status": status,
            "warnings": unique_warnings,
            "voiced_pitch_frames": voiced_frames,
            "formants_attempted": formants_attempted,
            "formant_frame_count": formant_frames if formants_attempted else None,
        },
        "runtime": {
            "audio_load_ms": load_ms,
            "acoustic_calculation_ms": calc_ms,
            "total_ms": total_ms,
        },
        "audio_path": os.path.abspath(audio_path),
        "audio_duration_seconds": _round(sound.duration, 3),
        "notes": [
            "Acoustic signal measurements only. Not a pronunciation correctness score.",
            "Forced-alignment interval boundaries are model-estimated.",
        ],
    }


def analyze_phone_interval(
    audio_path: str,
    start_seconds: float,
    end_seconds: float,
    phone: str | None = None,
) -> dict[str, Any]:
    load_started = time.perf_counter()
    sound = _load_sound(audio_path)
    load_ms = round((time.perf_counter() - load_started) * 1000, 1)
    return _analyze_with_sound(
        sound,
        start_seconds,
        end_seconds,
        phone,
        audio_path,
        load_ms,
    )


def _unavailable_interval_result(
    interval: dict[str, Any],
    error: AcousticExtractionError,
) -> dict[str, Any]:
    start = _to_finite(interval.get("start_seconds"))
    end = _to_finite(interval.get("end_seconds"))
    duration_ms = (
        round((end - start) * 1000, 1)
        if start is not None and end is not None
        else None
    )
    return {
        "phone": interval.get("phone"),
        "start_seconds": start,
        "end_seconds": end,
        "duration_ms": duration_ms,
        "acoustic_measurements": None,
        "error": {"code": error.code, "message": str(error)},
        "quality": {
            "status": "unavailable",
            "warnings": [_build_warning(error.code)],
        },
    }


def analyze_phone_intervals(audio_path: str, intervals: list[dict[str, Any]]) -> dict[str, Any]:
    """Load audio once and extract acoustics for multiple aligned intervals."""
    started = time.perf_counter()
    load_started = time.perf_counter()
    sound = _load_sound(audio_path)
    load_ms = round((time.perf_counter() - load_started) * 1000, 1)

    results: list[dict[str, Any]] = []
    for interval in intervals or []:
        try:
            results.append(
                _analyze_with_sound(
                    sound,
                    interval.get("start_seconds"),
                    interval.get("end_seconds"),
                    interval.get("phone"),
                    audio_path,
                    0,
                )
            )
        except AcousticExtractionError as error:
            results.append(_unavailable_interval_result(interval, error))

    return {
        "results": results,
        "runtime": {
            "audio_load_ms": load_ms,
            "total_ms": round((time.perf_counter() - started) * 1000, 1),
            "interval_count": len(results),
        },
    }


def to_json_safe(payload: dict[str, Any]) -> dict[str, Any]:
    """Ensure all numeric values are JSON-safe finite numbers or null."""

    def convert(value: Any) -> Any:
        if isinstance(value, dict):
            return {key: convert(item) for key, item in value.items()}
        if isinstance(value, list):
            return [convert(item) for item in value]
        if isinstance(value, (np.floating, np.integer)):
            value = value.item()
        if isinstance(value, float):
            return _to_finite(value)
        return value

    return convert(payload)
