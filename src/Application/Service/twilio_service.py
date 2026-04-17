from twilio.rest import Client
import os
from dotenv import load_dotenv

<<<<<<< HEAD
load_dotenv()
=======
# Garante que mudanças no .env sobrescrevam variáveis já existentes no ambiente.
load_dotenv(override=True)
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)

class TwilioService:

    @staticmethod
    def send_whatsapp(phone, code):

<<<<<<< HEAD
        sid = os.getenv("TWILIO_ACCOUNT_SID")
        token = os.getenv("TWILIO_AUTH_TOKEN")
        from_phone = os.getenv("TWILIO_PHONE_NUMBER")
=======
        sid = (os.getenv("TWILIO_ACCOUNT_SID") or "").strip().strip("'").strip('"')
        token = (os.getenv("TWILIO_AUTH_TOKEN") or "").strip().strip("'").strip('"')
        from_phone = (os.getenv("TWILIO_PHONE_NUMBER") or "").strip().strip("'").strip('"')

        if not sid or not token or not from_phone:
            raise RuntimeError("Twilio não configurado: verifique TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_PHONE_NUMBER no .env")
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)

        client = Client(sid, token)

        phone = phone.replace("+", "").strip()

        message = client.messages.create(
            body=f"Seu código de ativação é: {code}",
            from_=from_phone,
            to=f"whatsapp:+{phone}"
        )

<<<<<<< HEAD
=======
        print(f"[Twilio] Mensagem enviada. sid={message.sid} from={from_phone} to=whatsapp:+{phone}")
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)
        return message.sid