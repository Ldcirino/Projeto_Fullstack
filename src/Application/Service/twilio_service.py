from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

class TwilioService:

    @staticmethod
    def send_whatsapp(phone, code):

        sid = os.getenv("TWILIO_ACCOUNT_SID")
        token = os.getenv("TWILIO_AUTH_TOKEN")
        from_phone = os.getenv("TWILIO_PHONE_NUMBER")

        client = Client(sid, token)

        phone = phone.replace("+", "").strip()

        message = client.messages.create(
            body=f"Seu código de ativação é: {code}",
            from_=from_phone,
            to=f"whatsapp:+{phone}"
        )

        return message.sid