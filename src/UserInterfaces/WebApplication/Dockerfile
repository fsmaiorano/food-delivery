# Use Node.js as base image for building
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files from the correct context path
COPY UserInterfaces/WebApplication/package*.json ./

# Install dependencies with clean install for production
RUN npm ci --only=production=false && \
    npm cache clean --force

# Copy source code from the correct context path
COPY UserInterfaces/WebApplication/ .

# Build the Angular application for production
RUN npm run build -- --configuration=production

# List the build output for debugging and handle different build structures
RUN echo "Build completed. Checking output..." && \
    ls -la dist/ && \
    if [ -d "dist/web-application" ]; then \
        echo "Found dist/web-application directory" && \
        ls -la dist/web-application/ && \
        if [ -d "dist/web-application/browser" ]; then \
            echo "Contents of dist/web-application/browser:"; \
            find dist/web-application/browser -type f | head -20; \
        else \
            echo "No browser directory found, listing all contents:"; \
            find dist/web-application -type f | head -20; \
        fi \
    else \
        echo "No web-application directory found in dist, listing alternatives:"; \
        find dist -type d -maxdepth 2; \
    fi

# Use nginx for serving the built application
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from build stage
COPY --from=build /app/dist/web-application/browser /usr/share/nginx/html

# Ensure index.html exists - check for different possible file names
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then \
        mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    elif [ ! -f /usr/share/nginx/html/index.html ] && [ -f /usr/share/nginx/html/main*.js ]; then \
        echo '<!DOCTYPE html><html><head><title>Food Delivery</title></head><body><app-root></app-root></body></html>' > /usr/share/nginx/html/index.html; \
    fi

# Copy nginx configuration
COPY UserInterfaces/WebApplication/nginx.conf /etc/nginx/conf.d/default.conf

# Debug: List files and set proper permissions for Podman
RUN echo "Files in /usr/share/nginx/html:" && ls -la /usr/share/nginx/html/ && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80 only (HTTP)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
