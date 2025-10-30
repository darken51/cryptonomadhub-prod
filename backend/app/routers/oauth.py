"""
Google OAuth 2.0 authentication routes
Handles OAuth flow: redirect to Google, receive callback, create/link user
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from app.database import get_db
from app.models.user import User
from app.models.oauth_connection import OAuthConnection
from app.models.license import License
from app.utils.security import create_access_token, create_refresh_token, hash_password
from app.services.license_service import LicenseService
from app.routers.auth import get_current_user
from datetime import datetime, timezone, timedelta
import os
import logging
import secrets

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth/oauth", tags=["OAuth"])

# OAuth configuration
oauth = OAuth()

# Google OAuth configuration
oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Frontend redirect URL (where to send user after OAuth completes)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')


@router.get("/google/login")
async def google_login(request: Request):
    """
    Step 1: Redirect user to Google OAuth consent screen
    Frontend calls this endpoint, user is redirected to Google
    """
    redirect_uri = request.url_for('google_callback')
    logger.info(f"🔐 Google OAuth login initiated, redirect_uri: {redirect_uri}")

    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Step 2: Google redirects back here with authorization code
    Exchange code for access token, get user info, create/link user
    """
    try:
        # Exchange authorization code for access token
        token = await oauth.google.authorize_access_token(request)
        logger.info(f"🔐 Google OAuth token received")

        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")

        google_user_id = user_info.get('sub')  # Google's unique user ID
        email = user_info.get('email')
        full_name = user_info.get('name')
        email_verified = user_info.get('email_verified', False)

        logger.info(f"🔐 Google user authenticated: {email} (verified: {email_verified})")

        # Check if OAuth connection already exists
        oauth_conn = db.query(OAuthConnection).filter(
            OAuthConnection.provider == 'google',
            OAuthConnection.provider_user_id == google_user_id
        ).first()

        if oauth_conn:
            # Existing OAuth connection - log the user in
            user = oauth_conn.user
            logger.info(f"✅ Existing Google OAuth user logged in: {user.email}")

        else:
            # New OAuth connection - check if email exists
            user = db.query(User).filter(User.email == email).first()

            if user:
                # Email exists - link OAuth to existing account
                logger.info(f"🔗 Linking Google OAuth to existing user: {email}")
            else:
                # New user - create account
                logger.info(f"✨ Creating new user from Google OAuth: {email}")

                # Generate random password (user won't use it, OAuth only)
                random_password = secrets.token_urlsafe(32)

                user = User(
                    email=email,
                    password_hash=hash_password(random_password),
                    full_name=full_name,
                    email_verified=email_verified,  # Trust Google's email verification
                    created_at=datetime.now(timezone.utc)
                )
                db.add(user)
                db.flush()  # Get user.id

                # Create FREE license for new user
                license_service = LicenseService(db)
                license_service.create_free_license(user.id)

            # Create OAuth connection
            oauth_connection = OAuthConnection(
                user_id=user.id,
                provider='google',
                provider_user_id=google_user_id,
                email=email,
                access_token=token.get('access_token'),
                refresh_token=token.get('refresh_token'),
                token_expires_at=datetime.now(timezone.utc) + timedelta(seconds=token.get('expires_in', 3600)),
                created_at=datetime.now(timezone.utc)
            )
            db.add(oauth_connection)
            db.commit()

        # Generate JWT tokens for our app
        access_token = create_access_token(data={"sub": user.email})
        refresh_token = create_refresh_token()

        # Update user's refresh token
        user.refresh_token = refresh_token
        user.refresh_token_expires = datetime.now(timezone.utc) + timedelta(days=7)
        db.commit()

        # Redirect to frontend with tokens
        redirect_url = f"{FRONTEND_URL}/auth/oauth/callback?access_token={access_token}&refresh_token={refresh_token}"
        logger.info(f"✅ Google OAuth completed, redirecting to: {FRONTEND_URL}/auth/oauth/callback")

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        logger.error(f"❌ Google OAuth error: {str(e)}", exc_info=True)

        # Redirect to frontend with error
        error_url = f"{FRONTEND_URL}/auth/login?error=oauth_failed&message={str(e)}"
        return RedirectResponse(url=error_url)


@router.post("/google/link")
async def link_google_account(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Link Google account to existing logged-in user
    Used when user is already logged in and wants to add OAuth provider
    """
    # TODO: Implement this for users who want to link OAuth to existing account
    pass
