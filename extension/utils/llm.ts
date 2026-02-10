export interface AgentAction {
    type: "CLICK" | "TYPE" | "NAVIGATE" | "EXTRACT" | "SCROLL";
    index?: number;
    value?: string;
    description: string;
}

const TEMPLATES: Record<string, AgentAction[]> = {
    "linkedin": [
        { type: "NAVIGATE", value: "https://www.linkedin.com/search/results/people/", description: "Opening LinkedIn People Search" },
        { type: "SCROLL", description: "Loading profile elements..." },
        { type: "EXTRACT", description: "Harvesting profile metadata (Names, Titles, Connections)" }
    ],
    "github": [
        { type: "NAVIGATE", value: "https://github.com/trending", description: "Navigating to GitHub Trending" },
        { type: "EXTRACT", description: "Extracting trending repository statistics" }
    ],
    "summarize": [
        { type: "SCROLL", description: "Analyzing page structure for content summary" },
        { type: "EXTRACT", description: "Performing semantic textual extraction" }
    ]
};

export const planActions = async (prompt: string, domStructure: any[]): Promise<AgentAction[]> => {
    console.log("Rule-Engine: Analyzing prompt ->", prompt);

    const lowerPrompt = prompt.toLowerCase();

    // Exact Template Match
    for (const key in TEMPLATES) {
        if (lowerPrompt.includes(key)) {
            return TEMPLATES[key];
        }
    }

    // Generic Fallback (Smart Discovery)
    const loginButton = domStructure.find(n => n.text.toLowerCase().includes("login") || n.text.toLowerCase().includes("登入"));
    if (loginButton && (lowerPrompt.includes("login") || lowerPrompt.includes("登入"))) {
        return [
            { type: "CLICK", index: loginButton.index, description: `Automating login via identified element: ${loginButton.text}` }
        ];
    }

    return [
        { type: "SCROLL", description: "Exploring page content..." },
        { type: "EXTRACT", description: "No template found. Performing general page capture." }
    ];
};
