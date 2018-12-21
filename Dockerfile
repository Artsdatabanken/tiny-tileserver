FROM node:10 as dep

COPY package.json yarn.lock ./

RUN apt add --no-cache --virtual .build-deps python libpixman-1-dev libpixman-1-0 \
    &&  yarn install --frozen-lockfile --no-cache --production

FROM node:10
WORKDIR /app
COPY --from=dep /node_modules ./node_modules
EXPOSE 8000
ADD . .
CMD [ "node", "tiny-tileserver.js", "--port", "8000", "/data/" ]
