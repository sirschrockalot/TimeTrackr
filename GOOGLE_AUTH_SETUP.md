# Google OAuth Setup Guide

To enable Google authentication in your TimeTrackr application, follow these steps:

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
8. Copy the Client ID and Client Secret

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/time-tracking-app
```

## 3. Generate NextAuth Secret

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

## 4. MongoDB Setup

Make sure you have MongoDB running locally or use a cloud MongoDB instance. Update the `MONGODB_URI` accordingly.

## 5. Testing

1. Start your development server: `npm run dev`
2. Navigate to `/login`
3. Click "Continue with Google"
4. Complete the Google OAuth flow

## Notes

- The Google sign-in button will appear on the login page
- Users will be redirected to `/dashboard` after successful authentication
- User roles are set to 'employee' by default for new Google users
- The authentication state is managed by NextAuth.js 