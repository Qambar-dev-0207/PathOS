# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies based on package lock
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
