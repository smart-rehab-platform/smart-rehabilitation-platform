#!/usr/bin/env python
"""JSON-only CLI for V3.2.2 acoustic extraction. Logs go to stderr."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from analyze_phone_interval import (
    AcousticExtractionError,
    analyze_phone_interval,
    analyze_phone_intervals,
    to_json_safe,
)


def _emit(payload: dict) -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    sys.stdout.write(json.dumps(to_json_safe(payload), ensure_ascii=False))
    sys.stdout.write("\n")
    sys.stdout.flush()


def _read_request(args: argparse.Namespace) -> dict:
    if args.request:
        return json.loads(Path(args.request).read_text(encoding="utf-8"))
    if not sys.stdin.isatty():
        raw = sys.stdin.read()
        if raw.strip():
            return json.loads(raw)
    if args.audio and args.start is not None and args.end is not None:
        return {
            "audio_path": args.audio,
            "intervals": [
                {
                    "phone": args.phone,
                    "start_seconds": args.start,
                    "end_seconds": args.end,
                }
            ],
        }
    raise SystemExit("Provide --request JSON, stdin JSON, or --audio/--start/--end")


def main() -> int:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--audio")
    parser.add_argument("--start", type=float)
    parser.add_argument("--end", type=float)
    parser.add_argument("--phone")
    parser.add_argument("--request")
    args, _unknown = parser.parse_known_args()

    try:
        request = _read_request(args)
        audio_path = request.get("audio_path") or args.audio
        intervals = request.get("intervals")
        if intervals:
            payload = analyze_phone_intervals(audio_path, intervals)
        else:
            payload = {
                "results": [
                    analyze_phone_interval(
                        audio_path,
                        request.get("start_seconds", args.start),
                        request.get("end_seconds", args.end),
                        request.get("phone", args.phone),
                    )
                ]
            }
        _emit(payload)
        return 0
    except AcousticExtractionError as error:
        print(f"acoustic_cli error: {error}", file=sys.stderr)
        _emit(
            {
                "results": [],
                "error": {"code": error.code, "message": str(error)},
            }
        )
        return 2
    except Exception as error:
        print(f"acoustic_cli error: {error}", file=sys.stderr)
        _emit(
            {
                "results": [],
                "error": {"code": "acoustic_extraction_failed", "message": str(error)},
            }
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
