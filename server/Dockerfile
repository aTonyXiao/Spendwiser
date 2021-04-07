FROM node:15.14

# reference: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

# create the server root directory
WORKDIR /usr/src/server

# copy the package json files
COPY package*.json ./

# install the dependencies
RUN npm install

# copy the app source
COPY . .

# run the server
CMD ["npm", "start"]