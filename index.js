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
        <html lang="zh-Hant">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nova-Agent - Live</title>
            <style>
                body { font-family: sans-serif; background: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: #0f172a; padding: 2.5rem; border-radius: 1rem; border: 1px solid #1e293b; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
                h1 { color: #3b82f6; margin: 0 0 1rem; font-size: 2.5rem; }
                p { color: #94a3b8; line-height: 1.6; font-size: 1.1rem; }
                .status { margin-top: 1.5rem; display: inline-block; padding: 0.6rem 1.2rem; background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); border-radius: 2rem; font-weight: bold; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Nova-Agent 🚀</h1>
                <p>雲端託管伺服器已就緒。<br>此網址僅用於代理連線，請回到 GitHub 下載插件源碼。</p>
                <div class="status">GATEWAY ONLINE :: PORT ${PORT}</div>
            </div>
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
    console.log(`>>> ENV PORT: ${process.env.PORT || 'not-set'}`);
});
