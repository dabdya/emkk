FROM node:16.13.0-alpine

WORKDIR /emkk/frontend
RUN apk update

COPY package.json /emkk/frontend/
COPY package-lock.json /emkk/frontend/
RUN npm install

COPY . /emkk/frontend/

RUN npm run build:env
RUN chmod 777 /emkk/frontend/node_modules/.cache/.eslintcache
