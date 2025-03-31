# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run build

# Etapa 2: Produção
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

# Instala novamente em ambiente de produção (opcional para otimização)
RUN npm install --omit=dev

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Executa o script init.js e depois inicia o Next.js
CMD node ./db/init.js && npm start
