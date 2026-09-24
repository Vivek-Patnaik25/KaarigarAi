import os
import tempfile
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("Transcriber")

_whisper_model = None
_model_failed = False


def get_whisper_model():
    """Lazy loader for Faster-Whisper CPU model with int8 quantization."""
    global _whisper_model, _model_failed
    if _whisper_model is not None or _model_failed:
        return _whisper_model

    try:
        from faster_whisper import WhisperModel
        logger.info(f"Loading faster-whisper '{settings.WHISPER_MODEL_SIZE}' (int8 on CPU)...")
        _whisper_model = WhisperModel(
            settings.WHISPER_MODEL_SIZE,
            device="cpu",
            compute_type="int8",
        )
        logger.info("Faster-whisper initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize faster-whisper ({e}). Fallback transcription will be active.")
        _model_failed = True
        _whisper_model = None

    return _whisper_model


def _detect_audio_extension(audio_bytes: bytes) -> str:
    """Detects audio file extension based on magic bytes."""
    if len(audio_bytes) >= 4:
        header = audio_bytes[:4]
        if header == b"\x1aE\xdf\xa3":
            return ".webm"
        elif header == b"OggS":
            return ".ogg"
        elif header == b"RIFF":
            return ".wav"
        elif audio_bytes[:3] == b"ID3" or header[:2] == b"\xff\xfb":
            return ".mp3"
    return ".webm"


def transcribe_audio(audio_bytes: bytes, language_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Transcribes artisan voice description in any Indian language.
    1. Attempts ultra-fast Groq Whisper API (whisper-large-v3-turbo / whisper-large-v3).
    2. Falls back to local Faster-Whisper CPU int8 model.
    3. Handles webm, ogg, wav formats dynamically.
    """
    if not audio_bytes or len(audio_bytes) < 100:
        return {
            "transcript": "",
            "detected_language": language_hint or "hi",
            "language_confidence": 0.0,
            "duration_seconds": 0.0,
        }

    ext = _detect_audio_extension(audio_bytes)

    # 1. Try Groq Whisper Cloud API (ultra-fast, supports Indian regional languages)
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            # Use appropriate model
            model_name = "whisper-large-v3-turbo"
            
            transcription = client.audio.transcriptions.create(
                file=(f"audio{ext}", audio_bytes),
                model=model_name,
                language=language_hint if language_hint else None,
                response_format="verbose_json",
            )
            
            transcript_text = getattr(transcription, "text", "") or ""
            transcript_text = transcript_text.strip()
            
            detected_lang = getattr(transcription, "language", language_hint or "hi")
            duration = getattr(transcription, "duration", 5.0)

            if transcript_text:
                logger.info(f"Successfully transcribed voice via Groq Whisper ({len(transcript_text)} chars).")
                return {
                    "transcript": transcript_text,
                    "detected_language": detected_lang or (language_hint or "hi"),
                    "language_confidence": 0.98,
                    "duration_seconds": round(float(duration or 5.0), 1),
                }
        except Exception as e:
            logger.warning(f"Groq Whisper transcription failed or unavailable: {e}. Falling back to local Faster-Whisper.")

    # 2. Try Local Faster-Whisper CPU Model
    model = get_whisper_model()
    if model is not None:
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
                f.write(audio_bytes)
                tmp_path = f.name

            segments, info = model.transcribe(
                tmp_path,
                language=language_hint if language_hint else None,
                beam_size=5,
                vad_filter=True,
                vad_parameters={"min_silence_duration_ms": 300},
            )
            transcript = " ".join([s.text for s in segments]).strip()
            detected_lang = info.language if info.language else (language_hint or "hi")
            confidence = round(float(info.language_probability), 3) if hasattr(info, "language_probability") else 0.95
            duration = round(float(info.duration), 1) if hasattr(info, "duration") else 5.0

            if transcript:
                logger.info(f"Successfully transcribed voice via Faster-Whisper ({len(transcript)} chars).")
                return {
                    "transcript": transcript,
                    "detected_language": detected_lang,
                    "language_confidence": confidence,
                    "duration_seconds": duration,
                }
        except Exception as e:
            logger.error(f"Local Faster-Whisper transcription error: {e}")
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    # 3. Clean empty fallback if audio was silent/unintelligible (NO hardcoded fake story)
    return {
        "transcript": "",
        "detected_language": language_hint or "hi",
        "language_confidence": 0.0,
        "duration_seconds": 0.0,
    }

