# Etapa 1: build
FROM node:18-alpine AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos do projeto
COPY package*.json ./
COPY . .

# Instala dependências e gera build de produção
RUN npm install
RUN npm run build

# Etapa 2: produção
FROM node:18-alpine

WORKDIR /app

# Copia apenas os arquivos necessários da etapa de build
COPY --from=builder /app ./

# Expor porta padrão do Next.js
EXPOSE 3000

# Variáveis de ambiente (pode sobrescrever no painel)
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["npm", "start"]
