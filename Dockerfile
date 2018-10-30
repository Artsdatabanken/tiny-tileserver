FROM node:10-alpine as dep
WORKDIR /app

COPY package.json yarn.lock ./

RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
    &&  yarn install --frozen-lockfile --no-cache --production \
    && apk del .build-deps

FROM node:10-alpine
COPY --from=dep /app/node_modules ./node_modules
EXPOSE 8000
ADD . .
CMD [ "node", "tiny-tileserver.js", "--port", "8000", "/data/" ]
