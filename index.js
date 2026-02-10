const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
    <!DOCTYPE html>
    <html lang="zh-Hant">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova-Agent - 瀏覽器自動化助理</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #0f172a;
                color: #f8fafc;
                display: flex; 
                flex-direction: column;
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0; 
                text-align: center;
            }
            h1 { color: #3b82f6; font-size: 3rem; margin-bottom: 0.5rem; }
            p { color: #94a3b8; font-size: 1.2rem; max-width: 600px; line-height: 1.6; }
            .badge { 
                background: rgba(59, 130, 246, 0.1); 
                border: 1px solid rgba(59, 130, 246, 0.2);
                color: #60a5fa;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-bottom: 1rem;
            }
        </style>
    </head>
    <body>
        <div class="badge">Deploy Successful</div>
        <h1>託管網 (Nova-Agent)</h1>
        <p>您的 AI 瀏覽器自動化助理正在運行。這是一個 Extension 專案，請在 Chrome 中安裝以開始使用。</p>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on 0.0.0.0:${PORT}`);
});
