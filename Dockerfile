# Use Node.js 16.20.2 official image as the base image
FROM node:16.20.2

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN yarn install

# Copy project files to the working directory
COPY . .

# Start the application
CMD ["node", "index.js"]
