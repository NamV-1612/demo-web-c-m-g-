FROM node:20-alpine

WORKDIR /app

# Cài đặt thư viện
COPY package.json ./
RUN npm install

# Copy source code (bao gồm cả thư mục dist đã biên dịch)
COPY . .

# Expose cổng 5000
EXPOSE 5000

# Chạy server
CMD ["npm", "start"]
