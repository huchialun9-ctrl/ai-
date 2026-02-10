const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html lang="zh-Hant">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nova-Agent - Deployment Active</title>
            <style>
                body { font-family: sans-serif; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #3b82f6; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                h1 { color: #3b82f6; margin: 0 0 1rem; }
                p { color: #94a3b8; line-height: 1.6; }
                .status { margin-top: 1.5rem; display: inline-block; padding: 0.5rem 1rem; background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-radius: 2rem; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Nova-Agent 🚀</h1>
                <p>雲端託管環境已成功啟動。<br>這是一個瀏覽器擴充功能專案，請手動載入原始碼進行安裝。</p>
                <div class="status">System Online (Port: ${PORT})</div>
            </div>
        </body>
        </html>
    `);
});

server.on('error', (err) => {
    console.error('SERVER FATAL ERROR:', err);
});

server.listen(PORT, HOST, () => {
    console.log(`\n=========================================`);
    console.log(` Nova-Agent Server is now ONLINE`);
    console.log(` Listening on: http://${HOST}:${PORT}`);
    console.log(` Time: ${new Date().toISOString()}`);
    console.log(`=========================================\n`);
});
