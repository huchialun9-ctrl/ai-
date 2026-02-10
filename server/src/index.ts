import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { TaskManager } from './services/task-manager';

const fastify = Fastify({ logger: true });

async function main() {
    await fastify.register(cors);
    await fastify.register(websocket);

    fastify.get('/health', async () => ({ status: 'ok', version: '2.0.0' }));

    // HITL WebSocket Handler
    fastify.register(async (fastify) => {
        fastify.get('/api/v1/agent/ws', { websocket: true }, (connection: any, req) => {
            connection.socket.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
                const data = JSON.parse(message.toString());
                fastify.log.info(`WS Message received: ${data.type}`);

                // Broadcast to relevant listeners (e.g., the dashboard user for this taskId)
                if (data.type === 'HITL_REQUEST') {
                    // Forward to dashboard
                }

                connection.socket.send(JSON.stringify({ status: 'received', type: data.type }));
            });
        });
    });

    // Submit a new persistent task
    fastify.post('/api/v1/agent/task', async (request: FastifyRequest, reply: FastifyReply) => {
        const { userId, prompt } = request.body as any;

        const task = await TaskManager.createTask(userId || 'anonymous', prompt);

        fastify.log.info(`Task created: ${task.id}`);

        // Trigger Agent Loop (Fire and Forget)
        // In production, this should go to a job queue (BullMQ/Redis)
        import('./services/agent-service').then(({ AgentService }) => {
            AgentService.runAgentLoop(task.id, prompt).catch(err => {
                console.error(`Background Agent Error for task ${task.id}:`, err);
            });
        });

        return {
            taskId: task.id,
            status: task.status,
            message: `Agent task initiated: ${prompt}`
        };
    });

    // Get task status and steps (Persistence)
    fastify.get('/api/v1/agent/task/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as any;
        const state = await TaskManager.getTaskState(id);

        if (!state) {
            return reply.status(404).send({ error: 'Task not found' });
        }

        return state;
    });

    const port = Number(process.env.PORT) || 3001;
    try {
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

main();
