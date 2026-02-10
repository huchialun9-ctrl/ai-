export class SecurityService {
    private static SENSITIVE_PATTERNS = [
        /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit Cards
        /\b[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}\b/g, // UUIDs
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // Emails
        /\b\d{3}-\d{2}-\d{4}\b/g, // SSN (US)
    ];

    /**
     * Masks PII (Personally Identifiable Information) in strings before sending to LLM.
     */
    static maskPII(text: string): string {
        let maskedText = text;
        this.SENSITIVE_PATTERNS.forEach(pattern => {
            maskedText = maskedText.replace(pattern, '[REDACTED_PII]');
        });
        return maskedText;
    }

    /**
     * Checks if an action is sensitive and requires user confirmation.
     */
    static isSensitiveAction(actionType: string, params: any): boolean {
        const sensitiveActions = ['delete', 'pay', 'transfer', 'withdraw', 'remove_user'];

        if (sensitiveActions.includes(actionType.toLowerCase())) {
            return true;
        }

        // Heuristics for sensitive params
        const sensitiveKeywords = ['amount', 'price', 'confirm', 'password', 'key'];
        const paramKeys = Object.keys(params || {}).map(k => k.toLowerCase());

        return paramKeys.some(key => sensitiveKeywords.some(kw => key.includes(kw)));
    }
}
