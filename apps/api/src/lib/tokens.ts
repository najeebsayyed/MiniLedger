import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env.js';

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export interface TokenPayload {
  userId: string;
  phoneNumber: string;
}

export async function createAccessToken(payload: TokenPayload, expiresInSeconds: number = 604800): Promise<string> {
  return new SignJWT({
    phoneNumber: payload.phoneNumber,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secretKey);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secretKey, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });

  if (!payload.sub) {
    throw new Error('Token subject missing');
  }

  return {
    userId: payload.sub,
    phoneNumber: (payload.phoneNumber as string) || '',
  };
}
