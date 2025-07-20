# Node base image
FROM node:18

# App directory in container
WORKDIR /usr/src/app

# package.json and package-lock.json copy
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire app
COPY . .

# Expose app port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
