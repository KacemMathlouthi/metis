"""Security utilities for authentication and token management.

Provides JWT token generation/validation, OAuth token encryption, and CSRF protection.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from cryptography.fernet import Fernet
from jose import JWTError, jwt

from app.core.config import settings

# Fernet cipher for OAuth token encryption
cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())


def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """Create JWT access token with optional custom expiration.

    Encodes user data into a signed JWT token.
    Uses HS256 algorithm with SECRET_KEY for signing.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})

    encoded_jwt: str = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(user_id: str) -> str:
    """Create refresh token for obtaining new access tokens."""
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode = {"sub": str(user_id), "exp": expire, "type": "refresh"}

    encoded_jwt: str = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> dict[str, Any]:
    """Verify and decode JWT token.

    Raises JWTError if token is invalid, expired, or tampered with.
    Returns the decoded payload containing user_id and expiration.
    """
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}") from e


def encrypt_token(token: str) -> str:
    """Encrypt OAuth token before storing in database.

    Uses Fernet symmetric encryption to protect tokens.
    """
    encrypted: bytes = cipher_suite.encrypt(token.encode())
    return encrypted.decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt OAuth token from database.

    Reverses the encryption to get the original GitHub access token.
    """
    decrypted: bytes = cipher_suite.decrypt(encrypted_token.encode())
    return decrypted.decode()
