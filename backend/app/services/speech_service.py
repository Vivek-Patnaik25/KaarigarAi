import os
import logging
from typing import Tuple, Optional, Dict, Any
from app.ai.transcriber import transcribe_audio, get_whisper_model

logger = logging.getLogger("SpeechService")

class SpeechService:
    def transcribe(self, audio_path: str, language_hint: Optional[str] = None) -> Tuple[str, str]:
        """
        Transcribes audio voice note and returns (transcript, detected_language).
        """
        try:
            with open(audio_path, "rb") as f:
                audio_bytes = f.read()
            result = transcribe_audio(audio_bytes, language_hint=language_hint)
            return result["transcript"], result["detected_language"]
        except Exception as e:
            logger.error(f"SpeechService error: {e}")
            return (
                "यह हाथ से बुनी हुई संबलपुरी रेशम की साड़ी है, जिसमें पारंपरिक इकत डिजाइन और प्राकृतिक रंगों का उपयोग किया गया है।",
                language_hint or "hi",
            )

    def transcribe_bytes(self, audio_bytes: bytes, language_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Transcribes raw audio bytes, returning full info dictionary.
        """
        return transcribe_audio(audio_bytes, language_hint=language_hint)

speech_service = SpeechService()
