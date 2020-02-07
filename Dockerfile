# Build Stage 1
# This build created a staging docker image 
#
FROM node:12.14.1-alpine3.9 AS appbuild
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Build Stage 2
# This build takes the production build from staging build
#
FROM node:12.14.1-alpine3.9
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --production
COPY --from=appbuild /usr/src/app/dist .
EXPOSE 8005

CMD node ./bin/http.js --network=${NETWORK:-ropsten}