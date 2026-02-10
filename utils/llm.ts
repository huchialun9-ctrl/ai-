export interface AgentAction {
    type: "CLICK" | "TYPE" | "NAVIGATE" | "EXTRACT";
    index?: number;
    value?: string;
    description: string;
}

export const planActions = async (prompt: string, domStructure: any[]): Promise<AgentAction[]> => {
    console.log("Planning actions for:", prompt);
    // This is where the LLM API call would happen
    // For now, we return a mock plan based on common keywords
    if (prompt.toLowerCase().includes("linkedin")) {
        return [
            { type: "NAVIGATE", value: "https://www.linkedin.com/search/results/people/", description: "Navigating to LinkedIn search" },
            { type: "EXTRACT", description: "Extracting profile names and headlines" }
        ];
    }

    return [
        { type: "CLICK", index: 0, description: "Iterating on first interactive element" }
    ];
};
