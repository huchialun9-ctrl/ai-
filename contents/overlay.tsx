import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"]
}

const NovaOverlay = () => {
    const [highlight, setHighlight] = useState<DOMRect | null>(null)
    const [badgeText, setBadgeText] = useState("")

    useEffect(() => {
        const handleMessage = (msg: any) => {
            if (msg.type === "HIGHLIGHT_ELEMENT") {
                const el = document.querySelectorAll('button, a, input, [role="button"]')[msg.index] as HTMLElement;
                if (el) {
                    setHighlight(el.getBoundingClientRect())
                    setBadgeText(msg.action || "Inspecting...")
                }
            } else if (msg.type === "CLEAR_HIGHLIGHT") {
                setHighlight(null)
            }
        }
        chrome.runtime.onMessage.addListener(handleMessage)
        return () => chrome.runtime.onMessage.removeListener(handleMessage)
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
                    top: highlight.top - 4,
                    left: highlight.left - 4,
                    width: highlight.width + 8,
                    height: highlight.height + 8,
                    border: "2px solid #3b82f6",
                    borderRadius: "8px",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
                    transition: "all 0.2s ease-out"
                }}
            />

            {/* Floating Action Badge */}
            <div
                style={{
                    position: "absolute",
                    top: highlight.top - 32,
                    left: highlight.left,
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                }}>
                <span style={{ width: "6px", height: "6px", backgroundColor: "white", borderRadius: "50%", display: "inline-block" }} />
                {badgeText}
            </div>
        </div>
    )
}

export default NovaOverlay
