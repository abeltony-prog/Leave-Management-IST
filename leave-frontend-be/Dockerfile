# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, bun.lockb)
COPY package.json package-lock.json* bun.lockb* ./
# If using npm or yarn:
RUN npm install
# If using bun:
# RUN apk add --no-cache curl unzip
# RUN curl -fsSL https://bun.sh/install | bash
# ENV PATH="/root/.bun/bin:$PATH"
# RUN bun install

# Copy the rest of the application source code
COPY . .

# Build the application
# If using npm/yarn:
RUN npm run build
# If using bun:
# RUN bun run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 