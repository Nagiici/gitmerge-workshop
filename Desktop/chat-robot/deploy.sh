#!/bin/bash

# AI聊天陪伴机器人部署脚本

echo "🚀 开始部署AI聊天陪伴机器人..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 类型检查
echo "🔍 运行类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ 类型检查失败"
    exit 1
fi

echo "✅ 类型检查通过"

# 构建应用
echo "🏗️  构建应用..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 运行测试
echo "🧪 运行测试..."
npm test

if [ $? -ne 0 ]; then
    echo "⚠️  测试失败，但继续部署"
else
    echo "✅ 测试通过"
fi

echo ""
echo "🎉 部署准备完成！"
echo ""
echo "接下来可以："
echo "1. 本地运行: npm start"
echo "2. 部署到Vercel: vercel --prod"
echo "3. 使用Docker: docker-compose up -d"
echo ""
echo "请确保配置环境变量："
echo "- OPENAI_API_KEY: 你的OpenAI API密钥"
echo "- DATABASE_URL: 数据库路径"
echo ""

# 设置执行权限
chmod +x deploy.sh