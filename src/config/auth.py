import os
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired


def _serializer() -> URLSafeTimedSerializer:
    secret = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    return URLSafeTimedSerializer(secret_key=secret, salt="market-management")


def generate_token(user_id: int) -> str:
    """
    Gera um token assinado (não-JWT) para o seller autenticado.
    """
    return _serializer().dumps({"user_id": int(user_id)})


def decode_token(token: str, max_age_seconds: int = 60 * 60 * 24 * 7) -> int | None:
    """
    Retorna user_id se o token for válido; caso contrário None.
    """
    try:
        data = _serializer().loads(token, max_age=max_age_seconds)
        return int(data.get("user_id"))
    except (BadSignature, SignatureExpired, ValueError, TypeError):
        return None

