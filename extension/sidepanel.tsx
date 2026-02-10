import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Send as LucideSend,
    Bot as LucideBot,
    User as LucideUser,
    Settings as LucideSettings,
    Sparkles as LucideSparkles,
    Terminal as LucideTerminal,
    ChevronRight as LucideChevronRight,
    Activity as LucideActivity,
    Cpu as LucideCpu,
    Table as LucideTable
} from "lucide-react"

// React 19 Type Bypasses for Lucide
const Send = LucideSend as any
const Bot = LucideBot as any
const User = LucideUser as any
const Settings = LucideSettings as any
const Sparkles = LucideSparkles as any
const Terminal = LucideTerminal as any
const ChevronRight = LucideChevronRight as any
const Activity = LucideActivity as any
const Cpu = LucideCpu as any
const Table = LucideTable as any
import "./style.css"
import { ApiClient } from "./utils/api-client"
import { wsClient } from "./utils/ws-client"

function SidePanel() {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([
        { role: "assistant", content: "Hello! I am Nova-Agent. What task would you like me to perform in the browser?" }
    ])
    const [logs, setLogs] = useState<{ status: string; message: string; time: string }[]>([
        { status: "idle", message: "Awaiting instruction...", time: new Date().toLocaleTimeString() }
    ])
    const [autoMode, setAutoMode] = useState(false)
    const [view, setView] = useState<"chat" | "preview" | "settings">("chat")
    const [persona, setPersona] = useState({
        name: "Jianyu Fang",
        email: "jianyu@example.com",
        jobTitle: "Software Engineer",
        city: "San Francisco"
    })
    const [extractionData, setExtractionData] = useState<any[]>([
        { field: "Profile", value: "AI Researcher" },
        { field: "Location", value: "San Francisco" },
        { field: "Connection", value: "2nd" }
    ])
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Connect to WebSocket
        wsClient.connect()

        // Listen for messages
        const unsubscribe = wsClient.onMessage((data) => {
            if (data.type === 'log' || data.type === 'status') {
                setLogs(prev => [
                    { status: "info", message: data.message || JSON.stringify(data), time: new Date().toLocaleTimeString() },
                    ...prev.slice(0, 10) // Keep last 10 logs
                ])
            }
        })

        // Check Health
        ApiClient.healthCheck().then(alive => setIsConnected(alive))

        return () => {
            unsubscribe()
            wsClient.disconnect()
        }
    }, [])


    const handleSend = async () => {
        if (!input.trim()) return
        const prompt = input
        const newMsg = { role: "user", content: prompt }
        setMessages(prev => [...prev, newMsg])
        setInput("")

        // Add a log entry for the action
        setLogs(prev => [
            { status: "thinking", message: `Sending task: ${prompt.substring(0, 20)}...`, time: new Date().toLocaleTimeString() },
            ...prev.slice(0, 10)
        ])

        // Send to API
        try {
            const res = await ApiClient.createTask(prompt, persona.email)
            if (res) {
                setMessages(prev => [...prev, { role: "assistant", content: `Task started: ${res.taskId}. I am working on it.` }])
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "Failed to start task. Is the server running?" }])
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to server." }])
        }
    }

    return (
        <div className="flex flex-col h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="p-4 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`absolute -inset-1 ${isConnected ? 'bg-blue-500/20' : 'bg-red-500/20'} rounded-lg blur-sm animate-pulse`} />
                            <div className="relative p-2 bg-slate-800 rounded-lg border border-white/10">
                                <Sparkles className={`w-5 h-5 ${isConnected ? 'text-blue-400' : 'text-slate-400'}`} />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-bold text-sm tracking-tight bg-linear-to-br from-white to-slate-400 bg-clip-text text-transparent">Nova Agent</h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{isConnected ? 'System Online' : 'Offline'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Improved Toggle */}
                        <div
                            onClick={() => setAutoMode(!autoMode)}
                            className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
                        >
                            <span className={`text-[9px] font-bold uppercase tracking-tighter transition-colors ${autoMode ? 'text-blue-400' : 'text-slate-500'}`}>
                                {autoMode ? "Auto" : "Manual"}
                            </span>
                            <div className={`w-7 h-4 rounded-full relative transition-colors duration-300 ${autoMode ? 'bg-blue-500' : 'bg-slate-700'}`}>
                                <motion.div
                                    animate={{ x: autoMode ? 14 : 2 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-lg"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setView(view === "preview" ? "chat" : "preview")}
                            className={`p-2 rounded-lg border transition-all ${view === "preview" ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                        >
                            <Table className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setView(view === "settings" ? "chat" : "settings")}
                            className={`p-2 rounded-lg border transition-all ${view === "settings" ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-fade-right">
                    {["Summarize", "Extract Data", "Fill Form", "Deep Search"].map((label) => (
                        <button key={label} className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 transition-all active:scale-95">
                            {label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 relative overflow-x-hidden">
                <AnimatePresence mode="wait">
                    {view === "chat" && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                {messages.map((msg, i: number) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[90%] p-3 rounded-2xl relative overflow-hidden ${msg.role === 'user'
                                            ? 'bg-blue-600 shadow-lg shadow-blue-500/20'
                                            : 'bg-slate-800/50 border border-white/5 backdrop-blur-sm'
                                            }`}>
                                            <div className="flex gap-3 items-start">
                                                {msg.role === 'assistant' && (
                                                    <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                        <Bot className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                )}
                                                <p className="text-sm leading-relaxed text-slate-200">
                                                    {msg.content}
                                                </p>
                                            </div>
                                            {/* Decorative glass highlight for bubbles */}
                                            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Logs Section - Dynamic & Modern */}
                            <div className="space-y-3 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-white/5 rounded border border-white/10">
                                            <Activity className="w-3 h-3 text-blue-400" />
                                        </div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Live Telemetry</h2>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-600">ID: NV-942</span>
                                </div>
                                <div className="space-y-1.5">
                                    <AnimatePresence initial={false}>
                                        {logs.map((log, i: number) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={i}
                                                className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg border border-white/5 group hover:border-blue-500/30 transition-colors"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'idle' ? 'bg-slate-700' : 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                                                    {i < logs.length - 1 && <div className="w-px h-3 bg-white/5 mt-1" />}
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className="text-[11px] font-medium text-slate-300">{log.message}</span>
                                                    <span className="text-[9px] font-mono text-slate-600">{log.time}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {view === "preview" && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-xl border border-white/10 text-blue-400">
                                        <Table className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-sm font-bold tracking-tight">Data Preview</h2>
                                </div>
                                <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">Export CSV</button>
                            </div>

                            <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11px]">
                                        <thead className="bg-[#0f172a] border-b border-white/10">
                                            <tr>
                                                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Field</th>
                                                <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {extractionData.map((row, i: number) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 font-semibold text-slate-200">{row.field}</td>
                                                    <td className="px-4 py-3 text-slate-400 truncate max-w-[140px]">{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-3">
                                <Activity className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-[11px] leading-relaxed text-blue-200/60 font-medium tracking-wide">
                                    Reality Sync: This shows data captured from the current DOM context.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {view === "settings" && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-xl border border-white/10 text-blue-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-sm font-bold tracking-tight">Identity Persona</h2>
                                </div>
                            </div>
                            <div className="space-y-5">
                                {Object.entries(persona).map(([key, value]) => (
                                    <div key={key} className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-blue-400 transition-colors">
                                            {key.replace(/([A-Z])/g, ' $1')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPersona({ ...persona, [key]: e.target.value })}
                                                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-200"
                                            />
                                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-700" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex gap-3">
                                <Settings className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                                <p className="text-[11px] leading-relaxed text-orange-200/60 font-medium">
                                    Security Notice: Your persona data is encrypted and stored locally in Chrome's protected storage.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Interactive Footer */}
            <footer className="p-4 border-t border-white/5 bg-slate-900/60 backdrop-blur-xl">
                <div className="flex items-center gap-3 px-1 mb-3">
                    <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-blue-400/60" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">I/O Gateway</span>
                    </div>
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[9px] font-mono text-slate-700">v0.0.1</span>
                </div>

                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="指令輸入指令..."
                        className="w-full bg-slate-800/40 border border-white/10 rounded-2xl py-3 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none text-sm placeholder:text-slate-600 min-h-[60px]"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        className="absolute right-2 bottom-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center"
                    >
                        <Send className="w-4 h-4" />
                    </motion.button>
                </div>
            </footer>
        </div>
    )
}

export default SidePanel
