# Stage 1: Build the React Application
FROM node:24-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the Static Bundle using Nginx on port 8080
FROM nginx:alpine

# Copy built assets from Stage 1 to Nginx HTML root folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy clean nginx config (listens on 8080 for Cloud Run)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
