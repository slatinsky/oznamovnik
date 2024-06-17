FROM node:20.14.0-alpine as build

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install
COPY . /app
RUN npm run build
RUN ls -lah /app/build


FROM nginx:1-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/spa.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]