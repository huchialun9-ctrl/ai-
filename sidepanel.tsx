import { useState } from "react"
import "./style.css"
import { Send, Bot, User, Settings, Sparkles, Terminal } from "lucide-react"

function SidePanel() {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hello! I am Nova-Agent. What task would you like me to perform in the browser?" }
    ])
    const [logs, setLogs] = useState([
        { status: "idle", message: "Awaiting instruction..." }
    ])
    const [autoMode, setAutoMode] = useState(false)
    const [extractionData, setExtractionData] = useState<any[] | null>(null)
    const [view, setView] = useState<"chat" | "preview" | "settings">("chat")
    const [persona, setPersona] = useState({
        name: "Jianyu Fang",
        email: "jianyu@example.com",
        jobTitle: "Software Engineer",
        city: "San Francisco"
    })

    const handleSend = () => {
        if (!input.trim()) return
        setMessages([...messages, { role: "user", content: input }])
        setInput("")
        // Placeholder for AI logic
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground font-sans">
            <header className="p-4 border-b border-border space-y-4 bg-card/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="font-bold tracking-tight">Nova Agent</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-lg border border-border">
                            <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">{autoMode ? "Auto" : "Manual"}</span>
                            <button
                                onClick={() => setAutoMode(!autoMode)}
                                className={`w-8 h-4 rounded-full transition-all relative ${autoMode ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoMode ? 'left-4.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                        <button
                            onClick={() => setView(view === "chat" ? "preview" : "chat")}
                            className={`p-2 rounded-full transition-colors ${view === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"}`}
                            title="Toggle Data Preview"
                        >
                            <Terminal className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView(view === "settings" ? "chat" : "settings")}
                            className={`p-2 rounded-full transition-colors ${view === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"}`}
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {["Summarize", "Extract Data", "Auto Fill", "Research"].map((label) => (
                        <button key={label} className="whitespace-nowrap px-3 py-1.5 bg-accent/50 hover:bg-accent border border-border rounded-lg text-[10px] font-bold tracking-tight transition-colors">
                            {label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 flex flex-col">
                {view === "chat" && (
                    <div className="flex-1 space-y-4">
                        <section className="space-y-2">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl flex gap-3 ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted/50 border border-border shadow-sm'
                                        }`}>
                                        {msg.role === 'assistant' && <Bot className="w-5 h-5 mt-0.5 shrink-0" />}
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                        </section>

                        <section className="pt-4 border-t border-border mt-auto">
                            <div className="flex items-center gap-2 mb-3">
                                <Terminal className="w-3.5 h-3.5 text-primary" />
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action Logs</h2>
                            </div>
                            <div className="space-y-2">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg border border-border/50">
                                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'idle' ? 'bg-muted-foreground/30' : 'bg-primary animate-pulse'}`} />
                                        <span className="text-[11px] font-medium text-muted-foreground">{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {view === "preview" && (
                    <section className="flex-1 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold tracking-tight">Extracted Data</h2>
                            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Export CSV</button>
                        </div>
                        <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="px-3 py-2 font-bold uppercase tracking-wider text-muted-foreground">Field</th>
                                            <th className="px-3 py-2 font-bold uppercase tracking-wider text-muted-foreground">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {(extractionData || [
                                            { field: "Profile", value: "AI Researcher" },
                                            { field: "Location", value: "San Francisco" },
                                            { field: "Connection", value: "2nd" }
                                        ]).map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-3 py-2 font-semibold">{row.field}</td>
                                                <td className="px-3 py-2 text-muted-foreground truncate max-w-[120px]">{row.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-[10px] font-medium text-primary/80 uppercase tracking-widest">Verify data above before export.</p>
                        </div>
                    </section>
                )}

                {view === "settings" && (
                    <section className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold tracking-tight">Identity & Persona</h2>
                            <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-4">
                            {Object.entries(persona).map(([key, value]) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => setPersona({ ...persona, [key]: e.target.value })}
                                        className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-muted/50 border border-border rounded-xl">
                            <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                                This information is stored locally and used by the agent to automatically fill forms upon your request.
                            </p>
                        </div>
                    </section>
                )}
            </main>

            <footer className="p-4 border-t border-border bg-card/80 backdrop-blur-md">
                <div className="relative group">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Search LinkedIn for profiles..."
                        className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm placeholder:text-muted-foreground/50"
                        rows={2}
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-3 bottom-3 p-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md group-hover:shadow-primary/20"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-widest px-1">
                    <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Ready</span>
                    <span className="ml-auto opacity-50">v0.0.1</span>
                </div>
            </footer>
        </div>
    )
}

export default SidePanel
