# Use the official Node.js 20 Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Install dependencies first to leverage Docker's caching layer
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application code into the container
COPY . .

# Compile the TypeScript code (if you have TypeScript in the project)
RUN npm run build

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the API (assuming you use "start" script for production)
CMD ["npm", "run", "start"]
