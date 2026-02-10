const API_BASE_URL = "http://localhost:3001";

export interface TaskResponse {
    taskId: string;
    status: string;
    message: string;
}

export class ApiClient {
    static async healthCheck(): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE_URL}/health`);
            return res.ok;
        } catch (e) {
            console.error("Health check failed:", e);
            return false;
        }
    }

    static async createTask(prompt: string, userId: string = "anonymous"): Promise<TaskResponse | null> {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/agent/task`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt, userId })
            });

            if (!res.ok) {
                throw new Error(`Failed to create task: ${res.statusText}`);
            }

            return await res.json();
        } catch (e) {
            console.error("Create task failed:", e);
            return null;
        }
    }

    static async getTask(taskId: string): Promise<any> {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/agent/task/${taskId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error("Get task failed:", e);
            return null;
        }
    }
}
