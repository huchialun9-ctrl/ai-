import { NextResponse } from 'next/server';
import { TaskManager } from '@/lib/task-manager';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: taskId } = await params;
        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        const task = await TaskManager.getTaskState(taskId);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error: any) {
        console.error('Task Status API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
