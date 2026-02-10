import { OpenAI } from 'openai';
import { BrowserService } from './browser-service';
import { TaskManager } from './task-manager';
import { TaskStatus, StepStatus } from '@prisma/client';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class AgentService {
    static async runAgentLoop(taskId: string, goal: string) {
        console.log(`[Agent] Starting task ${taskId} with goal: ${goal}`);

        // 1. Launch Browser
        const { browser, page } = await BrowserService.launch();
        let stepCount = 0;
        const maxSteps = 10;

        try {
            while (stepCount < maxSteps) {
                stepCount++;
                console.log(`[Agent] Step ${stepCount}`);

                // 2. Get State
                const aom = await BrowserService.getAOMSnapshot(page);
                const url = page.url();

                // 3. Ask LLM
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are an autonomous browser agent. Your goal is: ${goal}.
                            Current URL: ${url}
                            
                            Here is the accessibility tree of the page:
                            ${JSON.stringify(aom, null, 2)}
                            
                            Output a JSON object with:
                            - thought: reasoning
                            - action: "navigate" | "click" | "type" | "finish" | "fail"
                            - params: { url, selector, text }
                            `
                        }
                    ],
                    response_format: { type: "json_object" }
                });

                const response = JSON.parse(completion.choices[0].message.content || "{}");
                console.log(`[Agent] Plan:`, response);

                // 4. Record Step
                const step = await TaskManager.addStep(taskId, stepCount, response.thought, response);

                // 5. Execute
                try {
                    if (response.action === 'navigate') {
                        await BrowserService.navigate(page, response.params.url);
                    } else if (response.action === 'click') {
                        await BrowserService.click(page, response.params.selector);
                    } else if (response.action === 'type') {
                        await BrowserService.type(page, response.params.selector, response.params.text);
                    } else if (response.action === 'finish') {
                        await TaskManager.updateStep(step.id, StepStatus.COMPLETED, "Finished");
                        await TaskManager.completeTask(taskId);
                        break;
                    } else if (response.action === 'fail') {
                        await TaskManager.updateStep(step.id, StepStatus.FAILED, "Agent gave up");
                        throw new Error("Agent failed");
                    }

                    await TaskManager.updateStep(step.id, StepStatus.COMPLETED, "Success");
                } catch (err: any) {
                    await TaskManager.updateStep(step.id, StepStatus.FAILED, err.message);
                    console.error(`[Agent] Step failed:`, err);
                }
            }
        } catch (err) {
            console.error(`[Agent] Task failed:`, err);
            await TaskManager.failTask(taskId);
        } finally {
            await BrowserService.close(browser);
        }
    }
}
