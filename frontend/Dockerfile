FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy source files (but not public directory yet)
COPY src ./src
COPY .env ./

# Create public directory and files manually
RUN mkdir -p public
RUN echo '<!DOCTYPE html>\n\
<html lang="en">\n\
  <head>\n\
    <meta charset="utf-8" />\n\
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />\n\
    <meta name="viewport" content="width=device-width, initial-scale=1" />\n\
    <meta name="theme-color" content="#000000" />\n\
    <meta name="description" content="Todo App created with MERN stack" />\n\
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />\n\
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />\n\
    <title>Todo App</title>\n\
  </head>\n\
  <body>\n\
    <noscript>You need to enable JavaScript to run this app.</noscript>\n\
    <div id="root"></div>\n\
  </body>\n\
</html>' > public/index.html

RUN echo '{\n\
  "short_name": "Todo App",\n\
  "name": "Todo MERN App",\n\
  "icons": [\n\
    {\n\
      "src": "favicon.ico",\n\
      "sizes": "64x64 32x32 24x24 16x16",\n\
      "type": "image/x-icon"\n\
    }\n\
  ],\n\
  "start_url": ".",\n\
  "display": "standalone",\n\
  "theme_color": "#000000",\n\
  "background_color": "#ffffff"\n\
}' > public/manifest.json

# Create an empty favicon.ico
RUN touch public/favicon.ico

# Debug to see what files are available
RUN echo "Directory structure:"
RUN ls -la
RUN echo "Public directory contents:"
RUN ls -la public/

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