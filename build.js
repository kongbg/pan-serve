import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取配置文件获取端口号
const configPath = path.join(__dirname, './config/index.js');

// 混淆后端代码
console.log('混淆后端代码...');
const serverDir = path.join(__dirname, './'); // 源码目录
const distDir = path.join(__dirname, './dist'); // 输出目录

// 确保dist目录存在
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });// 不存在就创建
}

// 递归混淆JS文件
const obfuscateDir = (dir, outDir) => {
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const outPath = path.join(outDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file === 'node_modules' || file === 'dist') {
                // 跳过 node_modules， dist 目录
                return;
            } else {
                obfuscateDir(filePath, outPath);
            }
        } else if (file.endsWith('.js')) {
            try {
                // 混淆JS文件
                const code = fs.readFileSync(filePath, 'utf8');
                const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
                    compact: true,                  // 代码压缩（保留换行、空格等格式）
                    controlFlowFlattening: true,    // 控制流扁平化（保持代码逻辑结构）
                    deadCodeInjection: true,        // 死代码注入（不添加无效代码）
                    identifierNamesGenerator: 'hexadecimal', // none' 保留原始变量名（不进行重命名）
                    stringArray: true,              // 字符串数组编码（保持字符串原样）
                    splitStrings: true,             // 字符串分割（保留完整字符串）
                    transformObjectKeys: true,      // 对象键名转换（保持数据结构）
                    unicodeEscapeSequence: true,    // Unicode 转义（保留原始字符） 
                    disableConsoleOutput: false,     // 控制台输出（不干扰原有逻辑）‌  
                    selfDefending: false,            // 自我防御机制（避免添加检测代码）
                    debugProtection: false,           // 调试保护
                    log: true                           // 控制台执行日志
                }).getObfuscatedCode();

                fs.writeFileSync(outPath, obfuscatedCode);
            } catch (error) {
                console.error(`Error obfuscating ${filePath}:`, error.message);
                // 如果混淆失败，直接复制原文件
                fs.copyFileSync(filePath, outPath);
            }
        } else {
            // 复制其他文件
            fs.copyFileSync(filePath, outPath);
        }
    });
};

try {
    // 混淆服务器代码
    obfuscateDir(serverDir, distDir);

    // 复制package.json和配置文件
    fs.copyFileSync(
        path.join(serverDir, 'package.json'),
        path.join(distDir, 'package.json')
    );

    // 确保配置目录存在
    const distConfigDir = path.join(distDir, 'config');
    if (!fs.existsSync(distConfigDir)) {
        fs.mkdirSync(distConfigDir, { recursive: true });
    }

    // 复制配置文件
    fs.copyFileSync(
        configPath,
        path.join(distConfigDir, 'index.js')
    );

    console.log('后端服务打包成功!');
} catch (error) {
    console.error('后端服务打包失败:', error.message);
    process.exit(1);
}