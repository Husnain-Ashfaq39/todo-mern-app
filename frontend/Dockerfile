FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Debug to see what files are available
RUN ls -la
RUN echo "Directory structure:"
RUN find . -type d | sort

# Set production build environment 
ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://backend:50010

# Build the application
RUN npm run build

# Debug to verify build output
RUN echo "Build output:"
RUN ls -la build/
RUN ls -la build/static || echo "No static directory"

# Production environment
FROM nginx:alpine

# Copy build files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Create a simple nginx configuration that handles React routing
RUN echo 'server {\n\
    listen       80;\n\
    server_name  localhost;\n\
    location / {\n\
        root   /usr/share/nginx/html;\n\
        index  index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    error_page   500 502 503 504  /50x.html;\n\
    location = /50x.html {\n\
        root   /usr/share/nginx/html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# Verify the final files in the nginx directory
RUN ls -la /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 