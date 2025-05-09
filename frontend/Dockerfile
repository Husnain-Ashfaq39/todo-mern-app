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
RUN echo "Contents of current directory:"
RUN ls -la
RUN echo "Node version: $(node -v)"
RUN echo "NPM version: $(npm -v)"

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