# Stage 1: Build the React Application
FROM node:24-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
ENV VITE_API_URL=/api/v1
RUN npm run build

# Stage 2: Serve the Static Bundle using Nginx
FROM nginx:alpine

# Copy built assets from Stage 1 to Nginx HTML root folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to handle SPA index routes redirects
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $$uri $$uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf


EXPOSE 80

# Start Nginx with dynamic port substitution for Cloud Run
CMD ["sh", "-c", "sed -i \"s/listen 80;/listen ${PORT:-80};/g\" /etc/nginx/conf.d/default.conf && exec nginx -g \"daemon off;\""]

