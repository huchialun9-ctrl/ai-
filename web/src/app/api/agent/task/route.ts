import { NextResponse } from 'next/server';
import { TaskManager } from '@/lib/task-manager';
import { AgentService } from '@/lib/agent-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const task = await TaskManager.createTask(userId || 'anonymous', prompt);

        // Trigger Agent Loop (Fire and Forget)
        // Note: In Vercel/Serverless, strict background tasks might be killed. 
        // But on Railway (Docker), this background promise keeps running as long as the container is alive.
        AgentService.runAgentLoop(task.id, prompt).catch(err => {
            console.error(`Background Agent Error for task ${task.id}:`, err);
        });

        return NextResponse.json({
            taskId: task.id,
            status: task.status,
            message: `Agent task initiated: ${prompt}`
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
