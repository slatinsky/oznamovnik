FROM node:20.14.0
ENV NODE_ENV development

WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm install
CMD ["npm", "run", "dev"]