"use client";

import { useState, useEffect } from 'react';
import { Bot, Send, Brain, Shield, Zap, Terminal, LogOut, Plus, ChevronRight, Activity, Code, Layout, Globe, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'agent' | 'vault' | 'logs' | 'dev'>('home');

  // States for different tabs
  const [apiKeys, setApiKeys] = useState<{ id: string, name: string, lastUsed: string | null, createdAt: string }[]>([]);
  const [personas, setPersonas] = useState<{ id: string, name: string, createdAt: string }[]>([]);
  const [tasks, setTasks] = useState<{ id: string, goal: string, status: string, createdAt: string }[]>([]);

  // UI States
  const [newTokenName, setNewTokenName] = useState('');
  const [displayedToken, setDisplayedToken] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Initial Eager Fetch for Home Stats
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const fetchAll = async () => {
        try {
          const [tokenRes, vaultRes] = await Promise.all([
            fetch('/api/tokens'),
            fetch('/api/vault')
          ]);

          if (tokenRes.ok) {
            const tokens = await tokenRes.json();
            setApiKeys(Array.isArray(tokens) ? tokens : []);
          } else {
            const err = await tokenRes.json();
            console.error('Tokens API Error:', err);
          }

          if (vaultRes.ok) {
            const p = await vaultRes.json();
            setPersonas(Array.isArray(p) ? p : []);
          } else {
            const err = await vaultRes.json();
            console.error('Vault API Error:', err);
          }
        } catch (err: any) {
          console.error('Eager fetch failed:', err);
          setRuntimeError(`Connectivity Error: ${err.message}`);
        }
      };
      fetchAll();
    }
  }, [status, session]);

  // Fetch Data based on active tab
  useEffect(() => {
    if (status !== 'authenticated' || !session) return;

    const refreshData = async () => {
      try {
        if (activeTab === 'dev') {
          const res = await fetch('/api/tokens');
          const data = await res.json();
          if (res.ok) setApiKeys(Array.isArray(data) ? data : []);
          else throw new Error(data.error || 'Failed to fetch tokens');
        } else if (activeTab === 'vault') {
          const res = await fetch('/api/vault');
          const data = await res.json();
          if (res.ok) setPersonas(Array.isArray(data) ? data : []);
          else throw new Error(data.error || 'Failed to fetch personas');
        } else if (activeTab === 'agent' && !isExecuting) {
          // Fetch recent tasks mock
          setTasks([
            { id: 't1', goal: 'Amazon data sync', status: 'COMPLETED', createdAt: new Date().toISOString() },
            { id: 't2', goal: 'Twitter reach automation', status: 'FAILED', createdAt: new Date().toISOString() }
          ]);
        }
      } catch (err: any) {
        console.error('Tab Fetch Error:', err);
        setRuntimeError(err.message);
      }
    };

    refreshData();
  }, [activeTab, session, status, isExecuting]);

  // Status Polling Effect
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (taskId && isExecuting) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/agent/task/${taskId}`);
          if (!res.ok) return;
          const data = await res.json();

          const agentMessages = data.steps.map((step: any) => ({
            role: 'assistant',
            content: `[Step ${step.stepIndex}] ${step.description}${step.result ? `\nResult: ${step.result}` : ''}`
          }));

          setMessages(prev => {
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
      }, 3000);
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
        fetch('/api/tokens').then(r => r.json()).then(d => setApiKeys(Array.isArray(d) ? d : []));
      }
    } catch (err) {
      console.error('Failed to generate token:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Synchronizing Matrix...</span>
        </div>
      </div>
    );
  }

  if (runtimeError) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-red-500/5 border border-red-500/20 p-10 rounded-4xl shadow-2xl">
          <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-600/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black italic mb-2 tracking-tighter">RUNTIME_RESTRICTION</h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">The system encountered an operational failure in production environment.</p>
          <div className="bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-xs text-red-400 mb-8 overflow-x-auto">
            {runtimeError}
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Retry Handshake</button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/40 backdrop-blur-xl border-r border-white/5 flex flex-col z-30">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter italic">NOVA</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Layout className="w-5 h-5" />} label="Overview" />
          <NavItem active={activeTab === 'agent'} onClick={() => setActiveTab('agent')} icon={<Brain className="w-5 h-5" />} label="Command Center" />
          <NavItem active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={<Shield className="w-5 h-5" />} label="Identity Vault" />
          <NavItem active={activeTab === 'dev'} onClick={() => setActiveTab('dev')} icon={<Code className="w-5 h-5" />} label="Developers" />
          <NavItem active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Terminal className="w-5 h-5" />} label="Telemetry" />
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-64 h-screen flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between bg-slate-900/20 backdrop-blur-sm">
          <h2 className="text-lg font-black tracking-widest uppercase text-slate-400">
            {activeTab === 'home' && 'SYSTEM_OVERVIEW'}
            {activeTab === 'agent' && 'MATRIX_RUNNER'}
            {activeTab === 'vault' && 'VAULT_ACCESS'}
            {activeTab === 'dev' && 'INFRA_KEYS'}
            {activeTab === 'logs' && 'DATA_STREAM'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-200">{session.user?.email}</span>
              <span className="text-[10px] text-blue-500 font-black tracking-widest leading-none">ROOT_ACCESS</span>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'home' && (
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/40 p-6 rounded-4xl border border-white/5 flex flex-col justify-between group transition-all hover:border-blue-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                      <Activity className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">System Heartbeat</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black italic tracking-tighter">99.8%</div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Operational Reliability</p>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-4xl border border-white/5 flex flex-col justify-between group transition-all hover:border-blue-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                      <Zap className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-[10px] font-black text-blue-500 uppercase">Active Sessions</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black italic tracking-tighter">{tasks.length}</div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Mission Instances Loaded</p>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-4xl border border-white/5 flex flex-col justify-between group transition-all hover:border-blue-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                      <Globe className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-[10px] font-black text-purple-500 uppercase">Identities</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black italic tracking-tighter">{personas.length}</div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Secured Vault Assets</p>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-4xl border border-white/5 flex flex-col justify-between group transition-all hover:border-blue-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                      <Shield className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-black text-orange-500 uppercase">Infrastructure</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black italic tracking-tighter">{apiKeys.length}</div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Active Access Nodes</p>
                  </div>
                </div>
              </div>

              {/* Main Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-slate-900/40 rounded-4xl border border-white/5 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-500" /> QUICK_INITIATE
                      </h3>
                      <button onClick={() => setActiveTab('agent')} className="text-[10px] font-black text-blue-500 hover:text-white transition-all uppercase tracking-widest">Advanced Command →</button>
                    </div>
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 flex gap-4 items-center">
                      <input
                        placeholder="Ask Nova to perform any mission..."
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-600"
                        readOnly
                        onClick={() => setActiveTab('agent')}
                      />
                      <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center cursor-pointer" onClick={() => setActiveTab('agent')}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 rounded-4xl border border-white/5 p-8">
                    <h3 className="text-lg font-black mb-6 uppercase tracking-tight italic">Mission Log Hub</h3>
                    <div className="space-y-4">
                      {tasks.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/8 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${t.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-bold text-slate-300">{t.goal}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase">{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-linear-to-br from-indigo-900/40 to-slate-900/40 rounded-4xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <h3 className="text-lg font-black mb-2 italic">Nova Assistant</h3>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">System is optimized for your browsing mission. 3 personas available for rotation.</p>
                      <div className="space-y-2">
                        <button onClick={() => setActiveTab('vault')} className="w-full py-3 bg-white/10 hover:bg-white text-white hover:text-indigo-900 border border-white/10 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest">Enter Vault</button>
                        <button onClick={() => setActiveTab('dev')} className="w-full py-3 bg-white/5 hover:bg-blue-600 border border-white/10 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest">Control API</button>
                      </div>
                    </div>
                    <Bot className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:text-white/10 transition-all rotate-12" />
                  </div>

                  <div className="bg-slate-900/40 rounded-4xl border border-white/5 p-8">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Account Info</h3>
                    <div className="space-y-4 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-slate-500 font-bold">Tier</span>
                        <span className="text-blue-500 font-black italic underline decoration-blue-500/20 offset-2">STANDARD_FOUNDER</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-slate-500 font-bold">Node Region</span>
                        <span className="text-slate-200 font-bold uppercase">AWS_AP_SOUTH_1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto h-full">
              <div className="lg:col-span-8 flex flex-col h-full space-y-6">
                <div className="flex-1 bg-slate-900/40 rounded-4xl border border-white/5 p-8 flex flex-col shadow-2xl overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                        <Brain className="w-16 h-16 mb-6 text-slate-600" />
                        <p className="text-sm font-bold tracking-widest max-w-xs">AWAITING OBJECTIVE INPUT...</p>
                      </div>
                    ) : (
                      messages.map((msg, i) => <ChatMessage key={i} {...msg} />)
                    )}
                    {isExecuting && (
                      <div className="flex gap-4 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="bg-blue-600/10 text-blue-400 text-[10px] font-black tracking-widest px-3 py-1 rounded-lg border border-blue-500/20 uppercase">Core processing...</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Define automation goal..."
                    className="w-full bg-slate-900/80 border border-white/10 rounded-3xl py-6 px-8 pr-20 text-sm focus:border-blue-500 transition-all outline-none shadow-2xl placeholder:text-slate-600"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isExecuting || !prompt.trim()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-slate-900/60 p-8 rounded-4xl border border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> RECENT_MISSIONS
                  </h3>
                  <div className="space-y-4">
                    {tasks.map(t => (
                      <div key={t.id} className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                        <p className="font-bold text-xs mb-2 line-clamp-1 text-slate-300">{t.goal}</p>
                        <div className="flex justify-between items-center text-[10px] font-black">
                          <span className="text-slate-600 uppercase italic">ID: {t.id}</span>
                          <span className={t.status === 'COMPLETED' ? 'text-emerald-500' : 'text-red-500'}>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-linear-to-br from-blue-600 via-blue-700 to-indigo-950 p-8 rounded-4xl relative overflow-hidden group shadow-2xl shadow-blue-600/10">
                  <div className="relative z-10">
                    <h3 className="text-xl font-black mb-1">PRO_TIER</h3>
                    <p className="text-xs text-blue-100/60 font-medium mb-6">Access headless cloud fleet and 100+ concurrent mission slots.</p>
                    <button className="w-full bg-white text-blue-900 font-black py-3 rounded-2xl text-xs hover:bg-blue-50 transition-all">UPGRADE_NOW</button>
                  </div>
                  <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:text-white/10 transition-all rotate-12" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map(p => (
                <div key={p.id} className="bg-slate-900/40 p-8 rounded-4xl border border-white/5 hover:border-blue-500/20 transition-all group">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                    <Bot className="w-7 h-7 text-slate-500 group-hover:text-blue-500 transition-all" />
                  </div>
                  <h4 className="font-black text-lg mb-1 tracking-tight">{p.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Sync Online • Integrity 100%
                  </p>
                  <button className="w-full py-3 bg-white/5 hover:bg-blue-600 text-slate-400 hover:text-white border border-white/10 hover:border-blue-500 rounded-2xl text-xs font-black transition-all">LOAD_PROFILE</button>
                </div>
              ))}
              <button className="bg-slate-900/20 rounded-4xl border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center gap-3 group hover:bg-blue-600/5 hover:border-blue-500/20 transition-all min-h-[250px]">
                <Plus className="w-8 h-8 text-slate-700 group-hover:text-blue-500 transition-all" />
                <span className="text-xs font-black text-slate-600 group-hover:text-slate-400 tracking-widest">INIT_NEW_IDENTITY</span>
              </button>
            </div>
          )}

          {activeTab === 'dev' && (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="bg-slate-900/40 p-10 rounded-4xl border border-white/5 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black italic tracking-tighter">API_ENVIRONMENT</h3>
                  <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase">E2EE Secured</span>
                  </div>
                </div>

                <div className="flex gap-4 mb-10">
                  <input
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="Identity tag (e.g. Node-Server-01)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-8 py-5 text-sm focus:border-blue-500 transition-all outline-none font-medium"
                  />
                  <button
                    onClick={handleGenerateToken}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    PROVISION_KEY
                  </button>
                </div>

                {displayedToken && (
                  <div className="mb-10 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <h5 className="text-[10px] font-black text-emerald-500 tracking-[0.3em] uppercase mb-4">Master Session Secret</h5>
                    <p className="font-mono text-base break-all text-emerald-200/90 leading-relaxed mb-6">{displayedToken}</p>
                    <button onClick={() => setDisplayedToken(null)} className="absolute top-6 right-8 text-emerald-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">Dismiss</button>
                    <p className="text-[9px] text-emerald-500/50 font-bold uppercase italic">Key is stored in one-way salted hash. Export now or it is lost permanently.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {apiKeys.map(k => (
                    <div key={k.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5">
                          <Terminal className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all" />
                        </div>
                        <div>
                          <h6 className="font-black text-sm text-slate-200">{k.name}</h6>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Created {new Date(k.createdAt).toLocaleDateString()} • {k.lastUsed ? `Active ${new Date(k.lastUsed).toLocaleTimeString()}` : 'IDLE'}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black italic rounded-lg tracking-[0.2em] border border-blue-500/20">LIVE</span>
                    </div>
                  ))}
                  {apiKeys.length === 0 && (
                    <div className="text-center py-20 bg-black/20 rounded-4xl border-2 border-dashed border-white/5 italic text-slate-600 font-bold">No active credentials recorded.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="max-w-6xl mx-auto h-full flex flex-col">
              <div className="flex-1 bg-black/60 rounded-4xl border border-white/5 p-10 font-mono text-xs overflow-hidden flex flex-col shadow-2xl relative">
                <div className="absolute top-0 right-0 p-10 pointer-events-none">
                  <div className="w-32 h-32 bg-blue-600/5 blur-3xl rounded-full"></div>
                </div>
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-400 font-black tracking-widest text-[10px] uppercase italic">NOVA_STREAM_v4.2</span>
                  </div>
                  <span className="text-[9px] text-slate-600 font-black tracking-[0.5em] uppercase">Status: Syncing_Buffer</span>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {messages.filter(m => m.role === 'assistant').map((msg, i) => (
                    <div key={i} className="flex gap-4 group hover:bg-white/5 p-2 rounded-lg transition-all">
                      <span className="text-slate-600 font-black text-[10px]">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-blue-500 font-black italic text-[10px] tracking-widest">RUNNER</span>
                      <span className="text-slate-300 leading-relaxed max-w-4xl">{msg.content}</span>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 italic space-y-2">
                      <Activity className="w-8 h-8 mb-4" />
                      <p>Listening for matrix heartbeats...</p>
                    </div>
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
      className={`flex items-center gap-4 px-6 py-4 rounded-3xl cursor-pointer transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-black italic' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 font-bold'
        }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</div>
      <span className="text-[13px] tracking-tight">{label}</span>
    </div>
  );
}

function ChatMessage({ role, content }: { role: string, content: string }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] p-6 rounded-4xl shadow-2xl relative transition-all ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/10 text-slate-200'}`}>
        <div className={`absolute -top-3 ${role === 'user' ? '-right-2' : '-left-2'} text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-900 border border-white/10`}>
          {role === 'user' ? 'Operator' : 'Nova_AI'}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
