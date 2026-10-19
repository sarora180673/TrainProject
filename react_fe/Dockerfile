FROM node:25.8.2 AS build

#install dependencies
WORKDIR /usr/src/testapp
COPY package*.json ./
RUN npm install

COPY . /usr/src/testapp
RUN npm run build
#RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache

# Stage 2: Serve with NGINX

FROM nginx:stable-alpine
COPY --from=build /usr/src/testapp/dist /usr/share/nginx/html
COPY --from=build /usr/src/testapp/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8083

#CMD npm run dev

# Preferred (Exec Form): Runs the command directly without a shell wrapper
CMD ["nginx", "-g", "daemon off;"]

