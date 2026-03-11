# Development Dockerfile for Next.js 16 + Tailwind v4 + Firebase
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source (will be overridden by volume mount in development)
COPY . .

EXPOSE 3000

# Bind to 0.0.0.0 so the dev server is accessible from the host
# Hot reload works via volume mount of source code
CMD ["sh", "-c", "npm install && npm run dev -- -H 0.0.0.0"]
