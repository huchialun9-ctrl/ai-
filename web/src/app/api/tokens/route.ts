import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generateToken, hashToken } from '@/lib/auth-tokens';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ error: 'Token name is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const rawToken = await generateToken();
        const hashedToken = await hashToken(rawToken);

        await prisma.apiKey.create({
            data: {
                userId: user.id,
                name: name,
                key: hashedToken
            }
        });

        // We only return the raw token ONCE
        return NextResponse.json({ token: rawToken });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                apiKeys: {
                    select: {
                        id: true,
                        name: true,
                        lastUsed: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return NextResponse.json(user?.apiKeys || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
