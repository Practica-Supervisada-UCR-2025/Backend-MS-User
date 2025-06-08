FROM node:18-alpine AS builder

# Setting the working directory in the container, to where things will be copied to and run from
WORKDIR /app

# Copy ONLY package files and install dependencies and exclude for now the whole codebase, to get advantage of the caching layers of npm
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Now copy the rest of the codebase and build the app(we include the .env file in this first stage, which ensures the 'npm run build' command runs succesfully AND 'consume' those credentials)
COPY . .
RUN npm run build

# Lightweight production image
FROM node:18-alpine AS runner

# Set NODE_ENV to production to make next js run efficiently
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/certs ./dist/certs

EXPOSE 3000

CMD ["node", "dist/src/app.js"]
