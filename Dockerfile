FROM node:12.15.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install --silent
RUN npm install -g pm2
COPY . /app
EXPOSE 8443
CMD ["pm2-runtime", "index.js"]