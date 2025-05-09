FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Add more verbose logging for debugging
RUN ls -la
RUN echo "Node version: $(node -v)"
RUN echo "NPM version: $(npm -v)"
# Show environment variables (will be empty here)
RUN env

# Set production build environment 
ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://backend:50010

# Build the application
RUN npm run build

# Production environment
FROM nginx:alpine

# Copy build files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Add nginx configuration if needed
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 