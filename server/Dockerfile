FROM node:20-slim

# Install OpenSSL - required by Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY .env* ./

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && npm start"]
