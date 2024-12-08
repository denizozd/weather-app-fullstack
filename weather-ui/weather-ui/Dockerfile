# Use the official Node.js image as the base
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the front-end dependencies
RUN npm install

# Copy the front-end source code
COPY . .

# Expose the port the front-end will run on
EXPOSE 5173

# Start the development server (using Vite in your case)
CMD ["npm", "run", "dev"]
