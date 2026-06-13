FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
# openssl for Prisma, vips-dev for sharp, and build-base for compiling native modules
RUN apk add --no-cache \
    openssl \
    vips-dev \
    build-base \
    python3 \
    pkgconfig

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
# We use npm install, but ensure it compiles native modules for the current architecture
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Remove development dependencies to keep the image small
# and clean up build tools
RUN apk del build-base python3 pkgconfig

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
