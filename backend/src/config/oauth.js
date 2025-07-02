// OAuth configuration placeholder
// This file will export functions and configs for Google OAuth (and others if needed)

const { OAuth2Client } = require('google-auth-library');
const { createError } = require('../utils/error');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw createError('Invalid Google token', 401);
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw createError('Google token expired', 401);
    }
    throw createError('Invalid Google token', 401);
  }
};

const getGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

module.exports = {
  googleClient,
  verifyGoogleToken,
  getGoogleAuthUrl
}; 