# 🔐 Google OAuth Setup Guide

This guide explains how to configure Google OAuth "Sign in with Google" for CryptoNomadHub.

## ✅ Current Status

- ✅ **Backend**: OAuth routes implemented (`/auth/oauth/google/login`, `/auth/oauth/google/callback`)
- ✅ **Frontend**: Google Sign In buttons added to login and register pages
- ✅ **Database**: `oauth_connections` table created
- ⚠️ **Configuration**: Requires Google Cloud Console setup (see below)

## 📋 Prerequisites

- Google Cloud Platform account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Production domain (for production setup)

## 🚀 Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (required for OAuth)

### 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Application type**: **Web application**
4. Configure **Authorized redirect URIs**:

   **Development:**
   ```
   http://localhost:8000/auth/oauth/google/callback
   ```

   **Production:**
   ```
   https://api.cryptonomadhub.io/auth/oauth/google/callback
   https://cryptonomadhub.io/api/auth/oauth/google/callback
   ```

5. Click **Create**
6. Copy your **Client ID** and **Client Secret**

### 3. Configure Environment Variables

**Backend** (`/backend/.env`):
```bash
# OAuth - Google Sign In
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Frontend** (already configured):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Development
# or
NEXT_PUBLIC_API_URL=https://api.cryptonomadhub.io  # Production
```

### 4. Restart Services

```bash
# Restart backend to load new credentials
docker restart nomadcrypto-backend

# Restart frontend (if needed)
cd frontend
npm run dev
```

## 🔄 OAuth Flow

1. **User clicks "Sign in with Google"** → Frontend redirects to `/auth/oauth/google/login`
2. **Backend redirects to Google** → User sees Google consent screen
3. **User authorizes** → Google redirects back to `/auth/oauth/google/callback`
4. **Backend processes callback**:
   - Exchanges authorization code for access token
   - Gets user info from Google
   - Creates user account if new (auto-verified email)
   - Links OAuth connection if email exists
   - Generates JWT tokens
5. **Backend redirects to frontend** → `/auth/oauth/callback?access_token=xxx&refresh_token=xxx`
6. **Frontend stores tokens** → Redirects to dashboard

## 🎯 Features

### ✅ Implemented

- **New user registration** via Google OAuth
- **Existing user login** via Google OAuth
- **Email auto-verification** (trust Google's verification)
- **Account linking** (if email already exists)
- **FREE license creation** for new users
- **JWT token generation** (same as regular login)
- **Session management** (refresh tokens)

### 🔮 Future Enhancements

- **Multiple OAuth providers** (GitHub, Twitter, Apple)
- **Account linking UI** (link/unlink from settings page)
- **OAuth connection management** (view connected accounts)

## 🛡️ Security Features

- **State parameter** (CSRF protection) handled by authlib
- **Token encryption** (access tokens stored securely)
- **Email verification** (trusted from Google)
- **No password storage** (for OAuth-only accounts)

## 🐛 Troubleshooting

### Error: "OAuth flow failed"
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Verify redirect URI matches exactly in Google Cloud Console
- Check backend logs: `docker logs nomadcrypto-backend`

### Error: "redirect_uri_mismatch"
- The redirect URI in your Google Cloud Console doesn't match the one being used
- Add `http://localhost:8000/auth/oauth/google/callback` for local development
- Add your production domain for production

### OAuth button doesn't work
- Check `NEXT_PUBLIC_API_URL` is set correctly in frontend `.env`
- Verify backend is running and accessible
- Check browser console for errors

## 📚 References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Authlib Documentation](https://docs.authlib.org/)
- [FastAPI OAuth Integration](https://authlib.org/docs/client/starlette.html)

## 🧪 Testing

**Local testing:**
1. Start backend: `docker-compose up backend`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000/auth/login`
4. Click "Sign in with Google"
5. Complete OAuth flow
6. Should redirect to dashboard

**What to test:**
- ✅ New user registration (creates account + FREE license)
- ✅ Existing user login (finds by email)
- ✅ Email verification (automatically verified)
- ✅ Token storage (JWT tokens work for API calls)
- ✅ Session persistence (refresh tokens work)

## 💡 Notes

- OAuth-only accounts have a random password hash (can't login with email/password)
- Users can still set a password later if needed
- Google provides: email, name, profile picture URL (stored in `oauth_connections`)
- Email must be unique (Google account can't be used if email already registered)

---

**Need help?** Contact the development team or check the backend logs for detailed error messages.
