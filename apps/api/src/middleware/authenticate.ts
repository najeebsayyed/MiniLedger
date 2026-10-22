import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/tokens.js';
import { db } from '../db/client.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication required. Missing or malformed authorization header.',
        requestId: req.requestId,
      },
    });
  }

  const token = authHeader.substring(7).trim();

  try {
    const payload = await verifyAccessToken(token);

    // Verify user exists in database
    const [userRecord] = await db
      .select({
        id: users.id,
        phoneNumber: users.phoneNumber,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!userRecord) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'User session is invalid or user no longer exists.',
          requestId: req.requestId,
        },
      });
    }

    req.user = {
      id: userRecord.id,
      phoneNumber: userRecord.phoneNumber,
      createdAt: userRecord.createdAt.toISOString(),
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid or expired access token.',
        requestId: req.requestId,
      },
    });
  }
}
