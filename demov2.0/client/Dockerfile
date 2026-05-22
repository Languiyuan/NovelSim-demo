FROM node:20.14.0-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
# 设置国内镜像源并安装依赖（确保获取 Linux 平台的原生模块）
RUN npm config set registry https://registry.npmmirror.com && npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:stable-perl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
