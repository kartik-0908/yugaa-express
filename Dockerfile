FROM node:20.12.0-alpine3.19

# Create and change to the app directory.
WORKDIR /

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Run prisma generate
RUN npx prisma generate

# Run the web service on container startup.
CMD [ "npm", "run", "dev" ]

# Inform Docker that the container listens on the specified port at runtime.
EXPOSE 3001
