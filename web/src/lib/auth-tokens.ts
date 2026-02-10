import { randomBytes, createHash } from 'crypto';
import prisma from './prisma';

export async function generateToken() {
    // Generate a secure random token (Nova prefix + 32 random chars)
    const rawToken = `nova_${randomBytes(24).toString('hex')}`;
    return rawToken;
}

export async function hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
}

export async function validateApiKey(apiKey: string) {
    if (!apiKey) return null;

    const hashedKey = await hashToken(apiKey);

    const keyData = await prisma.apiKey.findUnique({
        where: { key: hashedKey },
        include: { user: true }
    });

    if (keyData) {
        // Update last used timestamp
        await prisma.apiKey.update({
            where: { id: keyData.id },
            data: { lastUsed: new Date() }
        });
        return keyData.user;
    }

    return null;
}
