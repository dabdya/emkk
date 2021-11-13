FROM node:16.13.0-alpine

WORKDIR /frontend
RUN apk update

COPY package.json /frontend/
COPY package-lock.json /frontend/
RUN npm install

COPY . /frontend/