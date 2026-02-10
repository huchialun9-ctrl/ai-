import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { personas: true }
        });

        return NextResponse.json(user?.personas || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, data } = await request.json();
        if (!name || !data) {
            return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const persona = await prisma.persona.create({
            data: {
                userId: user.id,
                name: name,
                data: JSON.stringify(data) // In a real app, this should be encrypted
            }
        });

        return NextResponse.json(persona);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
