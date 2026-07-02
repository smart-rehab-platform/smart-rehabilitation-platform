# Faster-Whisper API

Local FastAPI service for transcribing uploaded audio files with `faster-whisper`.

## Endpoint

- `POST /transcribe`

Upload a multipart form file using the `audio` field.

Successful response:

```json
{
  "success": true,
  "transcript": "Hello world",
  "language": "en",
  "duration": 12.5
}
```

Error response:

```json
{
  "success": false,
  "message": "..."
}
```

## Environment

Optional:

```env
WHISPER_MODEL_SIZE=base
```

Default model size is `base`.

## Windows setup

From the repository root:

```powershell
cd python_services/faster_whisper_api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

## Example curl request

```bash
curl -X POST "http://localhost:8000/transcribe" ^
  -H "accept: application/json" ^
  -H "Content-Type: multipart/form-data" ^
  -F "audio=@sample.mp3"
```

## Notes

- The uploaded file is saved to a temporary file and deleted after transcription.
- `faster-whisper` may require FFmpeg to be installed and available in `PATH`.
