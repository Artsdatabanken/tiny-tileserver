FROM mhart/alpine-node
EXPOSE 8000
WORKDIR /app
COPY . .
RUN yarn install
CMD [ "npm", "start" ]