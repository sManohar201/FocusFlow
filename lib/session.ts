import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Constants for session handling
const COOKIE_NAME = 'focusflow_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'I8pDF4cdORL8SGwUJ3T6qaIV8kyyDEvGwItE73owGwo=';

// Extend NextApiRequest with session
declare module 'next' {
  interface NextApiRequest {
    session: {
      userId?: string;
      destroy: () => void;
      save: () => Promise<void>;
    }
  }
}

// Helper function to encrypt session data
function encryptSession(data: any): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(SESSION_SECRET.slice(0, 32)), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

// Helper function to decrypt session data
function decryptSession(encryptedData: string): any {
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    const iv = combined.subarray(0, 16);
    const authTag = combined.subarray(16, 32);
    const encrypted = combined.subarray(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(SESSION_SECRET.slice(0, 32)), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (e) {
    console.error('Session decrypt error:', e);
    return null;
  }
}

export function withSession(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Add session methods
    let sessionData: { userId?: string } | null = null;
    
    // Parse session from cookie
    const sessionCookie = req.cookies[COOKIE_NAME];
    if (sessionCookie) {
      sessionData = decryptSession(sessionCookie);
    }

    // Add session object to request
    req.session = {
      ...sessionData,
      destroy: () => {
        sessionData = null;
      },
      save: async () => {
        if (sessionData) {
          const encryptedSession = encryptSession(sessionData);
          res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encryptedSession}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
        } else {
          res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        }
      }
    };

    // Ensure session data is synced with session object
    Object.defineProperty(req.session, 'userId', {
      get: () => sessionData?.userId,
      set: (value) => {
        if (!sessionData) sessionData = {};
        sessionData.userId = value;
      }
    });

    try {
      await handler(req, res);
    } finally {
      // Save session changes if any
      if (sessionData) {
        const encryptedSession = encryptSession(sessionData);
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encryptedSession}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
      }
    }
  };
}
