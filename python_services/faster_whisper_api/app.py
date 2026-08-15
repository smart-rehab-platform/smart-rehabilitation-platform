import os
import tempfile
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel


DEFAULT_MODEL_SIZE = "base"
ALLOWED_LANGUAGES = {"en", "ar"}
DEFAULT_LANGUAGE = "en"

LANGUAGE_PROMPTS = {
    "en": (
        "The child is practicing English speech articulation. "
        "Transcribe only what is actually spoken. Do not invent missing words."
    ),
    "ar": (
        "الطفل يتدرب على نطق كلمات عربية. "
        "اكتب فقط ما يقوله الطفل فعليًا ولا تخمّن كلمات غير مسموعة."
    ),
}

app = FastAPI(title="Faster Whisper API")


@lru_cache(maxsize=1)
def get_whisper_model() -> WhisperModel:
    model_size = os.getenv("WHISPER_MODEL_SIZE", DEFAULT_MODEL_SIZE).strip() or DEFAULT_MODEL_SIZE
    # Force CPU: device="auto" selects CUDA on this Windows host and fails without cublas64_12.dll.
    return WhisperModel(model_size, device="cpu", compute_type="int8")


def resolve_language(value: str | None) -> str:
    normalized = (value or "").strip().lower()
    if normalized in ALLOWED_LANGUAGES:
        return normalized
    return DEFAULT_LANGUAGE


def build_error_response(message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message
        }
    )


@app.get("/health")
async def health_check():
    model_size = os.getenv("WHISPER_MODEL_SIZE", DEFAULT_MODEL_SIZE).strip() or DEFAULT_MODEL_SIZE
    return {
        "success": True,
        "message": "Faster-Whisper API is running",
        "model_size": model_size
    }


def serialize_word(word) -> dict | None:
    if word is None:
        return None

    token = getattr(word, "word", None)
    start = getattr(word, "start", None)
    end = getattr(word, "end", None)

    if token is None or start is None or end is None:
        return None

    payload = {
        "word": str(token).strip(),
        "start": float(start),
        "end": float(end),
    }

    probability = getattr(word, "probability", None)
    if probability is not None:
        payload["probability"] = float(probability)

    return payload


def serialize_segment(segment) -> dict:
    segment_words = getattr(segment, "words", None) or []
    words = [
        serialized
        for word in segment_words
        if (serialized := serialize_word(word)) is not None
    ]

    return {
        "start": float(segment.start),
        "end": float(segment.end),
        "text": str(segment.text or "").strip(),
        "words": words,
    }


@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form(DEFAULT_LANGUAGE),
):
    if not audio.filename:
        return build_error_response("Uploaded file must have a filename", 400)

    resolved_language = resolve_language(language)
    initial_prompt = LANGUAGE_PROMPTS[resolved_language]
    suffix = Path(audio.filename).suffix or ".tmp"
    temp_file_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file_path = temp_file.name
            file_bytes = await audio.read()

            if not file_bytes:
                return build_error_response("Uploaded audio file is empty", 400)

            temp_file.write(file_bytes)

        model = get_whisper_model()
        segments, _info = model.transcribe(
            temp_file_path,
            language=resolved_language,
            task="transcribe",
            initial_prompt=initial_prompt,
            word_timestamps=True,
        )
        segment_list = list(segments)
        serialized_segments = [serialize_segment(segment) for segment in segment_list]
        transcript = " ".join(
            segment.text.strip() for segment in segment_list if segment.text
        ).strip()

        duration = segment_list[-1].end if segment_list else 0.0

        return {
            "success": True,
            "transcript": transcript,
            "language": resolved_language,
            "duration": float(duration),
            "segments": serialized_segments,
        }
    except Exception as error:
        return build_error_response(str(error), 500)
    finally:
        await audio.close()

        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
