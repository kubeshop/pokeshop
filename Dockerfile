FROM node:16.14.0-alpine as build-ui
WORKDIR /ui
ENV PATH /ui/node_modules/.bin:$PATH
COPY ./web/package.json ./
COPY ./web/package-lock.json ./
RUN npm ci --silent
COPY ./web ./
RUN npm run build

# build
FROM node:alpine as build

WORKDIR /build
RUN npm i -g typescript
COPY ./api ./
RUN npm ci

RUN npm run build

# app
FROM node:alpine as app

WORKDIR /app
COPY ./api/package.json ./api/package-lock.json ./
RUN npm ci

EXPOSE 80

ENV NPM_RUN_COMMAND=api

COPY --from=build /build/.build/* ./
COPY --from=build /build/migrations/* ./migrations/
COPY --from=build-ui /ui/build ./ui

CMD ["sh", "-c", "npm run $NPM_RUN_COMMAND"]