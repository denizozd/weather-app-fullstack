# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install the back-end dependencies
RUN npm install

# Copy the rest of the back-end code
COPY . .

# Build the TypeScript code
RUN npx tsc

# Expose the port the app will run on
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]
