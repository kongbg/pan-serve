import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import cors from '@koa/cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import registerRoutes from './routes/index.js';
import responseHandler from './middleware/response.js';
import { port } from './config/index.js';
import sequelize from './db/index.js';
import './tasks/scheduler.js';  // 引入定时任务
try {
    await sequelize.authenticate();
    console.log('数据库链接成功！');
} catch (error) {
    console.error('数据库链接失败:', error);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const PORT = process.env.PORT || port;
let server = null;

const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (value === 'false') {
        acc[key] = false
    } else if (value === 'true') {
        acc[key] = true
    } else {
        acc[key] = value || true; // 支持无值参数（如 --debug）
    }
    return acc;
}, {});

// CORS 配置
app.use(cors({
    origin: (ctx) => {
        // 允许来自前端开发服务器的请求
        const allowedOrigins = ['http://localhost:6088', 'http://127.0.0.1:6088'];
        const requestOrigin = ctx.request.header.origin;
        if (allowedOrigins.includes(requestOrigin)) {
            return requestOrigin;
        }
        return '*'; // 或者返回特定的域名
    },
    credentials: true, // 关键：允许携带凭证
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Machineid'],
    maxAge: 86400, // 预检请求的有效期，单位为秒
}));

// 中间件
app.use(bodyParser());
app.use(responseHandler);

// 静态资源服务
app.use(serve(path.join(__dirname, 'public')));

// 自动注册路由
registerRoutes(app);

// 获取本机IP地址
const getLocalIPs = () => {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (const info of interfaceInfo) {
            // 只获取IPv4地址，排除内部地址127.0.0.1
            if (info.family === 'IPv4' && !info.internal) {
                addresses.push(info.address);
            }
        }
    }

    return addresses;
};


export const startKoa = () => {
    // 配合electron
    server = app.listen(PORT, () => {
        const localIPs = getLocalIPs();

        console.log('\n=== TodoList 应用服务已启动 ===\n');
        console.log(`🚀 前端本地访问: http://localhost:${PORT}`);

        // 显示所有可用的网络地址
        if (localIPs.length > 0) {
            console.log('\n📡 前端网络访问:');
            localIPs.forEach(ip => {
                console.log(`   http://${ip}:${PORT}`);
            });
        }

        console.log('\n=== 按 Ctrl+C 停止服务 ===\n');
    });
}

export const closeKoa = () => {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}


if (args.electron === false || args.electron === undefined) {
    // 开启koa
    startKoa()
}

// 关闭koa
// closeKoa()

export default app;
