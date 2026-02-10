export { }

console.log("Nova Agent: Background worker initialized");

// Handle extension icon clicks to open side panel
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

// Logic for handling agent sessions could go here
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START_AGENT_SESSION") {
        console.log("Nova Agent: Starting new session...");
        // Orchestrate planning and execution loop
        sendResponse({ status: "SESSION_INITIALIZED" });
    }
});
