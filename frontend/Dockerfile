FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# First copy public directory to ensure index.html is available
COPY public ./public

# Copy the rest of the source files
COPY src ./src

# Copy any other necessary files
COPY .env ./

# Add more verbose logging for debugging
RUN ls -la
RUN echo "Contents of public directory:"
RUN ls -la public/
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