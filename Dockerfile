# Use Node.js base image
FROM node:18-alpine

# Install cron
RUN apk add --no-cache dcron

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node

# Copy source code
COPY . .

# Create cron job file
RUN echo "* * * * * cd /app && npx tsx index.ts >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Create log file
RUN touch /var/log/cron.log

# Start script - runs crond in foreground and follows the log
CMD crond -f & tail -f /var/log/cron.log
