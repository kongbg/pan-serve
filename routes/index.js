import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 自动注册路由
export default function registerRoutes(app) {
    // 读取当前目录下的所有文件
    const files = fs.readdirSync(__dirname);

    // 遍历所有文件
    files.forEach(async (file) => {
        // 排除 index.js 和非 .js 文件
        if (file !== 'index.js' && file !== 'BaseRoute.js' && file.endsWith('.js')) {
            try {
                // 动态导入路由模块
                const router = (await import(`./${file}`)).default;
                // 注册路由
                app.use(router.routes());
                app.use(router.allowedMethods());
                // console.log(`Route registered: ${file}`);
            } catch (error) {
                console.error(`Failed to register route ${file}:`, error);
            }
        }
    })
} 