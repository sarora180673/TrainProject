FROM node:25.8.2 AS build

#install dependencies
WORKDIR /usr/src/testapp
COPY package*.json ./
RUN npm install

COPY . /usr/src/testapp
#RUN mkdir -p node_modules/.cache && chmod -R 777 node_modules/.cache


EXPOSE 5173

#CMD npm run dev

# Preferred (Exec Form): Runs the command directly without a shell wrapper
CMD ["npm", "run", "dev"]

