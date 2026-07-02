import os
import tempfile
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from faster_whisper import WhisperModel


DEFAULT_MODEL_SIZE = "base"

app = FastAPI(title="Faster Whisper API")


@lru_cache(maxsize=1)
def get_whisper_model() -> WhisperModel:
    model_size = os.getenv("WHISPER_MODEL_SIZE", DEFAULT_MODEL_SIZE).strip() or DEFAULT_MODEL_SIZE
    return WhisperModel(model_size)


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


@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    if not audio.filename:
        return build_error_response("Uploaded file must have a filename", 400)

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
        segments, info = model.transcribe(temp_file_path)
        segment_list = list(segments)
        transcript = " ".join(segment.text.strip() for segment in segment_list if segment.text).strip()

        duration = getattr(info, "duration", None)
        if duration is None:
            duration = segment_list[-1].end if segment_list else 0.0

        return {
            "success": True,
            "transcript": transcript,
            "language": getattr(info, "language", "unknown"),
            "duration": float(duration)
        }
    except Exception as error:
        return build_error_response(str(error), 500)
    finally:
        await audio.close()

        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
