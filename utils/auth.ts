import { verifyToken } from '@clerk/backend';

export async function getSubFromToken(authHeader: string): Promise<string> {
  try {
    // Check if auth header exists
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const verifiedToken = await verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY
    });

    // Extract and return sub
    if (!verifiedToken.sub) {
      throw new Error('No subject found in token');
    }

    return verifiedToken.sub;

  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid or expired token');
  }
} 