import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
}

const performAction = async (action: any) => {
    const elements = document.querySelectorAll('button, a, input, [role="button"]');
    const target = elements[action.index] as HTMLElement;

    if (!target) {
        throw new Error(`Element at index ${action.index} not found`);
    }

    // Visual feedback before action
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (action.type === "CLICK") {
        target.click();
    } else if (action.type === "TYPE") {
        (target as HTMLInputElement).value = action.value;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "EXECUTE_ACTION") {
        performAction(message.action)
            .then(() => sendResponse({ success: true }))
            .catch((err) => sendResponse({ success: false, error: err.message }));
        return true; // Keep channel open
    }
});
