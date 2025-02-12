# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Copy env file
COPY .env .env

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4002

# Run command
CMD ["npm", "run", "dev"]