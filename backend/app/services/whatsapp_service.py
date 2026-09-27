import logging
import re
import requests
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("WhatsAppService")

class WhatsAppService:
    """
    UltraMsg WhatsApp Notification Service for KaarigarAI.
    Sends instant WhatsApp alerts to artisans when buyers submit RFQs or inquiries.
    """

    def __init__(self):
        self.instance_id = settings.ULTRAMSG_INSTANCE_ID
        self.token = settings.ULTRAMSG_TOKEN
        self.default_phone = settings.DEMO_ARTISAN_PHONE

    def _sanitize_phone(self, phone: str) -> str:
        """Sanitizes phone number to international E.164 format digits."""
        if not phone:
            return ""
        cleaned = re.sub(r"[^\d+]", "", phone.strip())
        if cleaned.startswith("+"):
            return cleaned
        if cleaned.startswith("0"):
            cleaned = cleaned[1:]
        if len(cleaned) == 10:
            return f"+91{cleaned}"
        return f"+{cleaned}" if not cleaned.startswith("+") else cleaned

    def format_inquiry_message(self, data: Dict[str, Any]) -> str:
        """
        Formats the WhatsApp notification message in the artisan's preferred language.
        Defaults to Marathi as per demo workflow.
        """
        language = (data.get("language") or "mr").lower()
        buyer_name = data.get("buyer_name") or data.get("contact_name") or "Parampara Heritage Retail"
        product_title = data.get("product_title") or "हस्तकला वस्तू (Handcrafted Item)"
        quantity = data.get("proposed_quantity") or data.get("quantity") or 20
        unit_price = data.get("offered_unit_price") or data.get("price") or 1500
        
        try:
            unit_price_num = int(float(unit_price))
            total_estimated = int(float(quantity)) * unit_price_num
        except Exception:
            unit_price_num = 1500
            total_estimated = int(quantity) * unit_price_num

        lead_time = data.get("target_delivery_date") or data.get("lead_time") or "२० दिवसांत (Within 20 days)"
        product_id = data.get("product_id") or ""
        frontend_url = settings.FRONTEND_PUBLIC_URL.rstrip("/")
        product_url = f"{frontend_url}/p/{product_id}" if product_id else frontend_url

        if language == "mr":
            return (
                "🔔 *KaarigarAI — नवीन खरेदीदार विचारणा!*\n\n"
                "नमस्ते,\n"
                f"खरेदीदार *{buyer_name}* यांनी तुमच्या उत्पादनासाठी विचारणा पाठवली आहे:\n\n"
                f"🛍️ *उत्पादन:* {product_title}\n"
                f"📦 *मागणी (Qty):* {quantity} पीस\n"
                f"💰 *अंदाजे किंमत:* ₹{unit_price_num:,} / पीस (एकूण: ₹{total_estimated:,})\n"
                f"⏱️ *डिलिव्हरी:* {lead_time}\n\n"
                "🔗 तपशील पाहण्यासाठी व उत्तर देण्यासाठी टॅप करा:\n"
                f"{product_url}"
            )
        elif language == "hi":
            return (
                "🔔 *KaarigarAI — नई खरीदार पूछताछ!*\n\n"
                "नमस्ते,\n"
                f"खरीदार *{buyer_name}* ने आपके उत्पाद के लिए पूछताछ भेजी है:\n\n"
                f"🛍️ *उत्पाद:* {product_title}\n"
                f"📦 *मात्रा (Qty):* {quantity} पीस\n"
                f"💰 *अनुमानित मूल्य:* ₹{unit_price_num:,} / पीस (कुल: ₹{total_estimated:,})\n"
                f"⏱️ *डिलीवरी:* {lead_time}\n\n"
                "🔗 विवरण देखने और उत्तर देने के लिए टैप करें:\n"
                f"{product_url}"
            )
        else:
            return (
                "🔔 *KaarigarAI — New Buyer Inquiry!*\n\n"
                "Hello,\n"
                f"Buyer *{buyer_name}* has sent an inquiry for your product:\n\n"
                f"🛍️ *Product:* {product_title}\n"
                f"📦 *Quantity:* {quantity} pieces\n"
                f"💰 *Price:* ₹{unit_price_num:,} / piece (Total: ₹{total_estimated:,})\n"
                f"⏱️ *Delivery:* {lead_time}\n\n"
                "🔗 View details and respond:\n"
                f"{product_url}"
            )

    def send_inquiry_notification(self, inquiry_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sends WhatsApp notification via UltraMsg API.
        Designed to be called synchronously inside a FastAPI BackgroundTask.
        Catches all errors to ensure the main inquiry creation flow is never blocked or failed.
        """
        instance_id = settings.ULTRAMSG_INSTANCE_ID or self.instance_id
        token = settings.ULTRAMSG_TOKEN or self.token
        
        # Priority: configured DEMO_ARTISAN_PHONE -> payload phone -> fallback
        raw_phone = (
            settings.DEMO_ARTISAN_PHONE
            or self.default_phone
            or inquiry_data.get("artisan_phone")
            or inquiry_data.get("contact_phone")
            or "+919556828397"
        )
        recipient_phone = self._sanitize_phone(raw_phone)
        message_body = self.format_inquiry_message(inquiry_data)

        if not instance_id or not token or instance_id == "your_instance_id" or token == "your_token":
            logger.warning(
                f"[WhatsAppService] UltraMsg credentials not configured. "
                f"Simulated notification to {recipient_phone}:\n{message_body}"
            )
            return {
                "success": False,
                "simulated": True,
                "reason": "ULTRAMSG credentials not configured in environment.",
                "recipient": recipient_phone,
            }

        url = f"https://api.ultramsg.com/{instance_id}/messages/chat"
        payload = {
            "token": token,
            "to": recipient_phone,
            "body": message_body,
        }

        try:
            logger.info(f"[WhatsAppService] Sending WhatsApp notification to {recipient_phone} via UltraMsg...")
            response = requests.post(url, data=payload, timeout=10)
            res_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {"text": response.text}
            
            if response.status_code == 200 and (res_data.get("sent") == "true" or res_data.get("id")):
                logger.info(f"[WhatsAppService] Successfully sent WhatsApp message to {recipient_phone}. Msg ID: {res_data.get('id')}")
                return {"success": True, "data": res_data, "recipient": recipient_phone}
            else:
                logger.warning(f"[WhatsAppService] UltraMsg response warning: status={response.status_code}, body={res_data}")
                return {"success": False, "status_code": response.status_code, "data": res_data}
        except Exception as e:
            logger.warning(f"[WhatsAppService] Failed to send WhatsApp notification to {recipient_phone}: {e}")
            return {"success": False, "error": str(e)}

whatsapp_service = WhatsAppService()
