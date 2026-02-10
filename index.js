const http = require('http');

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = '0.0.0.0';

const server = http.createServer((req, res) => {
    // Basic Health Check
    if (req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
        return;
    }

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="zh-Hant" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Agent | 打造您的 AI 瀏覽器自動化助理</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        brand: {
                            50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 
                            400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 
                            800: '#1e40af', 900: '#1e3a8a', 950: '#020617',
                        }
                    },
                    animation: {
                        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'float': 'float 6s ease-in-out infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-20px)' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #020617; }
        .glass { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .glow-text { text-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        .gradient-border { border: 1px solid transparent; background: linear-gradient(#0f172a, #0f172a) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box; }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .agent-sim { animation: float 4s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
    </style>
</head>
<body class="text-slate-200 antialiased overflow-x-hidden">

    <!-- Navbar -->
    <nav class="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Nova Agent</span>
            </div>
            <div class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                <a href="#features" class="hover:text-blue-400 transition-colors">功能特性</a>
                <a href="#demo" class="hover:text-blue-400 transition-colors">在線演示</a>
                <a href="https://github.com/huchialun9-ctrl/ai-" target="_blank" class="hover:text-blue-400 transition-colors">GitHub</a>
                <button class="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">立即下載</button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-44 pb-32 px-6 overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div class="flex-1 text-center lg:text-left z-10">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                    <span class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span class="text-xs font-bold text-blue-400 uppercase tracking-widest">v0.0.1 Beta 版已上線</span>
                </div>
                <h1 class="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8 bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent">
                    讓瀏覽器<br><span class="text-blue-500 glow-text">成為您的</span> AI 分身
                </h1>
                <p class="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Nova Agent 是一款強大的網頁自動化擴充功能。透過語義理解與自動填表，將重複的網頁工作交給 AI，解放您的雙手。
                </p>
                <div class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start font-bold">
                    <button class="group w-full sm:w-auto px-8 py-4 bg-blue-600 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 text-white">
                        <span>新增至 Chrome</span>
                        <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                    <button class="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-bold text-slate-300">
                        查看源碼倉庫
                    </button>
                </div>
            </div>

            <!-- Agent Simulation -->
            <div class="flex-1 w-full max-w-[420px] relative agent-sim">
                <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur-xl opacity-20"></div>
                <div class="relative w-full aspect-[9/16] bg-[#020617] rounded-[2rem] border border-white/10 shadow-2xl p-1 overflow-hidden">
                    <!-- Extension Header Simulator -->
                    <div class="absolute top-0 left-0 w-full p-4 glass border-b border-white/5 flex items-center justify-between z-10">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <span class="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Nova Agent</span>
                        </div>
                        <div class="flex gap-1.5">
                            <div class="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                            <div class="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        </div>
                    </div>
                    <!-- Chat Content Simulator -->
                    <div class="mt-20 px-4 space-y-4 h-full">
                        <div class="flex justify-start">
                            <div class="bg-slate-800/80 p-3 rounded-2xl rounded-tl-none text-[11px] leading-relaxed max-w-[85%] border border-white/5">
                                您好！我是 Nova-Agent。請問今天需要我幫您抓取哪方面的資料？
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <div class="bg-blue-600 p-3 rounded-2xl rounded-tr-none text-[11px] leading-relaxed max-w-[85%] shadow-lg shadow-blue-600/20">
                                幫我整理剛才在 LinkedIn 看到的 5 位工程師簡介。
                            </div>
                        </div>
                        <div class="bg-slate-900/50 p-4 rounded-xl border border-blue-500/20 animate-pulse">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span class="text-[9px] font-bold text-blue-400 uppercase">智慧掃描中...</span>
                            </div>
                            <div class="space-y-2">
                                <div class="h-1.5 w-full bg-slate-800 rounded"></div>
                                <div class="h-1.5 w-3/4 bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                    <!-- Footer Simulator -->
                    <div class="absolute bottom-0 left-0 w-full p-4 glass border-t border-white/5">
                        <div class="flex items-center gap-2 px-3 py-2.5 bg-slate-800/50 rounded-xl border border-white/10">
                            <span class="text-[10px] text-slate-500">輸入指令...</span>
                            <div class="ml-auto p-1.5 bg-blue-600 rounded-lg">
                                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-32 px-6">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-20">
                <h2 class="text-3xl lg:text-5xl font-extrabold mb-6">核心技能</h2>
                <div class="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="p-8 rounded-[2rem] glass hover:bg-blue-600/5 transition-all group border-white/5">
                    <div class="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500 text-blue-400">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-4">語義洞察</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">
                        超越傳統腳本。Nova 能像人類一樣「看懂」網頁結構，精準識別按鈕、表單與數據區塊。
                    </p>
                </div>
                <!-- Feature 2 -->
                <div class="p-8 rounded-[2rem] glass hover:bg-emerald-600/5 transition-all group border-white/5">
                    <div class="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500 text-emerald-400">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-4">結構化輸出</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">
                        一鍵將網頁紛雜的資訊整理成清晰的表格或 JSON，支援 LinkedIn 搜索、GitHub 項目等主流站點。
                    </p>
                </div>
                <!-- Feature 3 -->
                <div class="p-8 rounded-[2rem] glass hover:bg-indigo-600/5 transition-all group border-white/5">
                    <div class="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-500 text-indigo-400">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-4">隱私保護</h3>
                    <p class="text-slate-400 text-sm leading-relaxed">
                        您的身份 Persona 資料完全加密儲存於本地。不經您的授權，任何數據都不會離開您的瀏覽器。
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-white/5 opacity-50 text-center">
        <p class="text-xs tracking-widest uppercase font-bold text-slate-500">
            Nova Agent © 2026 • Powering Browser Automation
        </p>
    </footer>

</body>
</html>
    `);
});

server.on('error', (err) => {
    console.error('SERVER ERROR:', err);
});

server.listen(PORT, HOST, () => {
    console.log(`\n>>> NOVA-AGENT PROXY STARTED <<<`);
    console.log(`>>> BIND ADDRESS: http://${HOST}:${PORT}`);
    console.log(`>>> SYSTEM TIME: ${new Date().toISOString()}`);
});
