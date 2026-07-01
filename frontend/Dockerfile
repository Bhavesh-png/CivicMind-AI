# Stage 1: Build the React Application
FROM node:24-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the Static Bundle using Nginx
FROM nginx:alpine

# Copy built assets from Stage 1 to Nginx HTML root folder
COPY --from=build /app/dist /usr/share/nginx/html

# Write Nginx config as a template using $PORT placeholder (substituted at runtime)
RUN printf 'server {\n\
    listen $PORT;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/templates/default.conf.template

# Remove the default nginx config so our template takes over
RUN rm /etc/nginx/conf.d/default.conf

# Expose port (Cloud Run overrides this with $PORT=8080 at runtime)
EXPOSE 8080

# nginx:alpine official image automatically runs envsubst on /etc/nginx/templates/*.template
# and outputs the result to /etc/nginx/conf.d/ before nginx starts
CMD ["nginx", "-g", "daemon off;"]
