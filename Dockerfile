FROM mhart/alpine-node
EXPOSE 8000
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --no-cache --production
COPY . .
CMD [ "node", "tiny-tileserver.js", "--port 8000 /data/" ]