FROM node:20.14.0-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
# 设置国内镜像源并安装依赖（确保获取 Linux 平台的原生模块）
RUN npm config set registry https://registry.npmmirror.com && npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20.14.0-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 9999
CMD ["node", "dist/main"]
