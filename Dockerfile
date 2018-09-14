FROM node
EXPOSE 8000
WORKDIR /usr/src/app
COPY . .
RUN yarn install
CMD [ "npm", "start" ]