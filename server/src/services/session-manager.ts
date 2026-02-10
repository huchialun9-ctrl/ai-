import { Browser, BrowserContext, chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Multi-tenant Session Manager
 * Orchestrates isolated Playwright contexts for different users/tasks.
 */
export class SessionManager {
    private static browser: Browser | null = null

    private static async getBrowser() {
        if (!this.browser) {
            this.browser = await chromium.launch({ headless: true })
        }
        return this.browser
    }

    /**
     * Creates or restores an isolated browser context.
     */
    static async getContext(userId: string, sessionId: string): Promise<BrowserContext> {
        const browser = await this.getBrowser()

        // Check if session exists in DB
        const savedSession = await prisma.browserContext.findUnique({
            where: { sessionId }
        })

        if (savedSession && savedSession.storageState) {
            return await browser.newContext({
                storageState: savedSession.storageState as any
            })
        }

        // Create new context if not found
        const context = await browser.newContext()

        // Save new context placeholder
        await prisma.browserContext.create({
            data: {
                userId,
                sessionId,
                storageState: {}
            }
        })

        return context
    }

    /**
     * Persists the current session state (cookies, localstorage) to the cloud db.
     */
    static async persistContext(sessionId: string, context: BrowserContext) {
        const storageState = await context.storageState()

        await prisma.browserContext.update({
            where: { sessionId },
            data: {
                storageState: storageState as any
            }
        })
    }

    /**
     * Closes and cleans up a context.
     */
    static async closeContext(sessionId: string, context: BrowserContext) {
        await this.persistContext(sessionId, context)
        await context.close()
    }
}
