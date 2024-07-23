# Dockerfile for Node.js App
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Start the Node.js app
CMD ["node", "index.js"]

# Expose the port the app runs on
EXPOSE 3000
