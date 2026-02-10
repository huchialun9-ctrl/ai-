import { Page } from 'playwright';
import crypto from 'crypto';

export class BrowserService {
    static async launch() {
        const { chromium } = require('playwright');
        const browser = await chromium.launch({ headless: false }); // Debug mode
        const context = await browser.newContext();
        const page = await context.newPage();
        return { browser, page };
    }

    static async close(browser: any) {
        await browser.close();
    }

    static async navigate(page: Page, url: string) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    static async click(page: Page, selector: string) {
        await page.click(selector);
    }

    static async type(page: Page, selector: string, text: string) {
        await page.fill(selector, text);
    }

    /**
     * Captures the Accessibility Object Model (AOM) snapshot.
     * This is 10x smaller than full DOM and much better for LLM reasoning.
     */
    static async getAOMSnapshot(page: Page) {
        return await (page as any).accessibility.snapshot({
            interestingOnly: true
        });
    }

    /**
     * Detects visual differences between current page and previous state.
     * Useful for confirming if a click actually triggered a navigation or popup.
     */
    static async detectVisualChange(page: Page, previousHash?: string) {
        const screenshot = await page.screenshot();
        const currentHash = crypto.createHash('md5').update(screenshot).digest('hex');

        const changed = previousHash !== undefined && currentHash !== previousHash;

        return {
            changed,
            currentHash,
            screenshot: screenshot.toString('base64')
        };
    }

    /**
     * Implementation of 'Advanced Scoping' - filtering the AOM for specific goals.
     */
    static async getSemanticContext(page: Page, goalHint: string) {
        const aom = await this.getAOMSnapshot(page);
        // Future: Filter AOM nodes based on goalHint using NLP or simple distance matching
        return aom;
    }
}
