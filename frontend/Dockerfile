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

# Write Nginx config listening on 8080 (Cloud Run default PORT)
RUN printf 'server {\n\
    listen 8080;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
