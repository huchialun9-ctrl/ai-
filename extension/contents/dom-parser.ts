import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
}

// Semantic DOM Parser logic
function simplifyDOM() {
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"], [onclick]');

    const nodes = Array.from(interactiveElements).map((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;

        return {
            index,
            tag: el.tagName.toLowerCase(),
            text: el.textContent?.trim().slice(0, 50) || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '',
            type: el.getAttribute('type') || '',
            location: { x: rect.left, y: rect.top }
        };
    }).filter(Boolean);

    console.log('Nova Agent: Simplified DOM', nodes);
    return nodes;
}

window.addEventListener("load", () => {
    console.log("Nova Agent: Content script loaded");
});

// Listen for messages from standard sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_DOM_STRUCTURE") {
        sendResponse({ structure: simplifyDOM() });
    }
});
