from twilio.rest import Client
import os

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
whatsapp_number = "whatsapp:+14155238886"

client = Client(account_sid, auth_token)

class TwilioService:

    @staticmethod
    def send_whatsapp(phone, code):
        message = client.messages.create(
            body=f"Seu código de ativação é: {code}",
            from_=whatsapp_number,
            to=f"whatsapp:{phone}"
        )
        return message.sid