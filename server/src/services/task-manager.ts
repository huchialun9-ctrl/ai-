import { PrismaClient, TaskStatus, StepStatus } from '@prisma/client'

const prisma = new PrismaClient()

export class TaskManager {
    static async createTask(userId: string, goal: string) {
        return prisma.task.create({
            data: {
                userId,
                goal,
                status: TaskStatus.RUNNING,
            }
        })
    }

    static async addStep(taskId: string, index: number, description: string, action: any) {
        return prisma.taskStep.create({
            data: {
                taskId,
                stepIndex: index,
                description,
                action,
                status: StepStatus.PENDING,
            }
        })
    }

    static async updateStep(stepId: string, status: StepStatus, result?: string, error?: string) {
        return prisma.taskStep.update({
            where: { id: stepId },
            data: {
                status,
                result,
                error,
                updatedAt: new Date()
            }
        })
    }

    static async getTaskState(taskId: string) {
        return prisma.task.findUnique({
            where: { id: taskId },
            include: {
                steps: {
                    orderBy: { stepIndex: 'asc' }
                }
            }
        })
    }

    static async failTask(taskId: string) {
        return prisma.task.update({
            where: { id: taskId },
            data: { status: TaskStatus.FAILED }
        })
    }

    static async completeTask(taskId: string) {
        return prisma.task.update({
            where: { id: taskId },
            data: { status: TaskStatus.COMPLETED }
        })
    }
}
