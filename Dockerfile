# Base nodejs
FROM node:20-alpine

# Folder work
WORKDIR /app

# Copy package.json 
COPY package*.json ./

# install dependencies
RUN npm install --production

# Copy source code to container
COPY . .

# 6. Expose port(8080)
EXPOSE 8080

# Start container
CMD ["npm", "start"]

