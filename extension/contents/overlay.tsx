import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
}

const NovaOverlay = () => {
    const [highlight, setHighlight] = useState<DOMRect | null>(null)
    const [badgeText, setBadgeText] = useState("")

    useEffect(() => {
        // Inject keyframes for animations
        const style = document.createElement('style');
        style.textContent = `
      @keyframes nova-scan {
        0% { top: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
      @keyframes nova-pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
    `;
        document.head.appendChild(style);

        const handleMessage = (msg: any) => {
            if (msg.type === "HIGHLIGHT_ELEMENT") {
                const elements = document.querySelectorAll('button, a, input, [role="button"]');
                const el = elements[msg.index] as HTMLElement;
                if (el) {
                    setHighlight(el.getBoundingClientRect())
                    setBadgeText(msg.action || "Inspecting...")
                }
            } else if (msg.type === "CLEAR_HIGHLIGHT") {
                setHighlight(null)
            }
        }
        chrome.runtime.onMessage.addListener(handleMessage)
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage)
            if (document.head.contains(style)) document.head.removeChild(style);
        }
    }, [])

    if (!highlight) return null

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
                zIndex: 2147483647
            }}>
            {/* Element Highlighting Box */}
            <div
                style={{
                    position: "absolute",
                    top: highlight.top - 6,
                    left: highlight.left - 6,
                    width: highlight.width + 12,
                    height: highlight.height + 12,
                    border: "2px solid #3b82f6",
                    borderRadius: "10px",
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                    animation: "nova-pulse 2s infinite",
                    transition: "all 0.3s cubic-bezier(0.19, 1, 0.22, 1)",
                    overflow: "hidden"
                }}
            >
                {/* Scanning Line */}
                <div style={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    height: "2px",
                    background: "linear-gradient(to right, transparent, #60a5fa, transparent)",
                    animation: "nova-scan 2s linear infinite"
                }} />
            </div>

            {/* Floating Action Badge */}
            <div
                style={{
                    position: "absolute",
                    top: highlight.top - 40,
                    left: highlight.left,
                    backgroundColor: "#1e293b",
                    border: "1px solid #3b82f6",
                    color: "#f8fafc",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backdropFilter: "blur(4px)",
                    transition: "all 0.3s ease"
                }}>
                <div style={{ width: "8px", height: "8px", backgroundColor: "#3b82f6", borderRadius: "50%", animation: "nova-pulse 1.5s infinite" }} />
                {badgeText.toUpperCase()}
            </div>
        </div>
    )
}

export default NovaOverlay
