"use client";

import { useState, useEffect } from 'react';
import { Bot, Send, Brain, Database, Shield, Zap, Terminal, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'agent' | 'vault' | 'logs' | 'dev'>('agent');
  const [apiKeys, setApiKeys] = useState<{ id: string, name: string, lastUsed: string | null, createdAt: string }[]>([]);
  const [newTokenName, setNewTokenName] = useState('');
  const [displayedToken, setDisplayedToken] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Status Polling Effect
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (taskId && isExecuting) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/agent/task/${taskId}`);
          if (!res.ok) return;
          const data = await res.json();

          // Map steps to assistant messages
          const agentMessages = data.steps.map((step: any) => ({
            role: 'assistant',
            content: `[Step ${step.stepIndex}] ${step.description}${step.result ? `\nResult: ${step.result}` : ''}`
          }));

          setMessages(prev => {
            // Only update if we have new information to avoid jitter
            if (agentMessages.length > prev.filter(m => m.role === 'assistant').length) {
              const userMsgs = prev.filter(m => m.role === 'user');
              return [...userMsgs, ...agentMessages];
            }
            return prev;
          });

          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            setIsExecuting(false);
            setTaskId(null);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => clearInterval(pollInterval);
  }, [taskId, isExecuting]);

  const handleSend = async () => {
    if (!prompt.trim() || isExecuting) return;

    const userPrompt = prompt;
    setPrompt('');
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }]);
    setIsExecuting(true);

    try {
      const res = await fetch('/api/agent/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.email || 'anonymous',
          prompt: userPrompt
        })
      });

      const data = await res.json();
      if (data.taskId) {
        setTaskId(data.taskId);
      } else {
        throw new Error(data.error || 'Failed to start task');
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
      setIsExecuting(false);
    }
  };

  // Fetch API Keys
  useEffect(() => {
    if (activeTab === 'dev') {
      fetch('/api/tokens')
        .then(res => res.json())
        .then(data => setApiKeys(Array.isArray(data) ? data : []))
        .catch(err => console.error('Failed to fetch tokens:', err));
    }
  }, [activeTab]);

  const handleGenerateToken = async () => {
    if (!newTokenName) return;
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTokenName })
      });
      const data = await res.json();
      if (data.token) {
        setDisplayedToken(data.token);
        setNewTokenName('');
        // Refresh list
        fetch('/api/tokens')
          .then(res => res.json())
          .then(data => setApiKeys(Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error('Failed to generate token:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 flex flex-col z-30">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Nova V2</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem active={activeTab === 'agent'} onClick={() => setActiveTab('agent')} icon={<Brain className="w-5 h-5" />} label="Command Center" />
          <NavItem active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={<Shield className="w-5 h-5" />} label="Identity Vault" />
          <NavItem active={activeTab === 'dev'} onClick={() => setActiveTab('dev')} icon={<Terminal className="w-5 h-5" />} label="Developers" />
          <NavItem active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal className="w-5 h-5" />} label="Live Telemetry" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`}></div>
              <span className="text-xs font-medium">{isExecuting ? 'Agent Active' : 'Cloud Runner Online'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-64 h-screen flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-slate-900/20">
          <h2 className="text-lg font-bold">
            {activeTab === 'agent' && 'Command Center'}
            {activeTab === 'vault' && 'Identity Vault'}
            {activeTab === 'logs' && 'Live Telemetry'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-200">{session.user?.name || session.user?.email}</span>
              <span className="text-[10px] text-slate-500 font-medium">Enterprise Tier</span>
            </div>
            <button
              onClick={() => signOut()}
              className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'agent' && (
            <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chat Panel */}
              <div className="lg:col-span-1 flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-4xl p-6 shadow-2xl overflow-hidden">
                <div className="flex-1 space-y-6 mb-6 overflow-y-auto pr-2 scrollbar-hide">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 select-none">
                      <Bot className="w-12 h-12 mb-4" />
                      <p className="text-sm font-medium text-center px-8">Ready to initiate mission. Enter your objective below.</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <ChatMessage key={i} role={msg.role} content={msg.content} />
                  ))}
                  {isExecuting && taskId && messages.filter(m => m.role === 'assistant').length === 0 && (
                    <ChatMessage role="assistant" content="System: Initializing autonomous session... Bypassing cloud guards." />
                  )}
                </div>
                <div className="relative">
                  <textarea
                    placeholder="Refine mission..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    disabled={isExecuting}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-3xl py-4 px-6 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none text-sm shadow-xl disabled:opacity-50"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isExecuting || !prompt.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 rounded-2xl text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:bg-slate-700 disabled:shadow-none"
                  >
                    {isExecuting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remote Viewport */}
              <div className="lg:col-span-2 relative bg-black/40 rounded-4xl border border-white/10 overflow-hidden shadow-2xl group">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Live Frame</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-full text-[10px] font-bold text-slate-400">
                    ID: PLAYWRIGHT_RNR_01
                  </div>
                </div>

                <div className="w-full h-full flex items-center justify-center bg-slate-900/20">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Zap className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Awaiting Stream...</p>
                  </div>
                </div>

                {/* Overlays for HITL */}
                <div className="absolute inset-0 bg-blue-600/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="max-w-3xl space-y-8">
              <div className="bg-slate-900/60 p-8 rounded-4xl border border-white/5">
                <h3 className="text-xl font-bold mb-6">Master Identity</h3>
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Full Name" value="Jianyu Fang" />
                  <Field label="Email" value="jianyu@example.com" />
                  <Field label="Job Title" value="Software Engineer" />
                  <Field label="Location" value="San Francisco, CA" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dev' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-slate-900/60 p-8 rounded-4xl border border-white/5">
                <h3 className="text-xl font-bold mb-2">API Tokens</h3>
                <p className="text-slate-400 text-sm mb-6">Develop your own tools using our infrastructure.</p>

                <div className="flex gap-4 mb-8">
                  <input
                    type="text"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="Key name (e.g. My App)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-sm focus:border-blue-500 transition-all outline-none"
                  />
                  <button
                    onClick={handleGenerateToken}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl transition-all"
                  >
                    Generate Key
                  </button>
                </div>

                {displayedToken && (
                  <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden group">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Secret Token (Save it now, it won't be shown again!)</div>
                    <div className="font-mono text-sm break-all text-emerald-100">{displayedToken}</div>
                    <button
                      onClick={() => setDisplayedToken(null)}
                      className="absolute top-4 right-4 text-emerald-500 hover:text-emerald-400 font-bold text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {apiKeys.map(key => (
                    <div key={key.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div>
                        <div className="font-bold text-slate-200">{key.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                          Created {new Date(key.createdAt).toLocaleDateString()} • Last used: {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20">ACTIVE</span>
                      </div>
                    </div>
                  ))}
                  {apiKeys.length === 0 && (
                    <div className="text-center py-12 text-slate-600 italic">No API tokens generated yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="bg-black/40 rounded-3xl border border-white/5 p-6 font-mono text-xs overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                  <span className="text-slate-500 uppercase font-bold tracking-widest">System Telemetry</span>
                  <span className="text-emerald-500 font-bold">LIVE_READY</span>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {messages.filter(m => m.role === 'assistant').map((msg, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-blue-400 font-bold">LOG</span>
                      <span className="text-slate-300">{msg.content}</span>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-slate-600 italic">No activity recorded for current session.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
    >
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function ChatMessage({ role, content }: { role: string, content: string }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-5 rounded-4xl ${role === 'user' ? 'bg-blue-600 shadow-xl' : 'bg-slate-900/80 border border-white/5'
        }`}>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{label}</label>
      <div className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium">
        {value}
      </div>
    </div>
  );
}
