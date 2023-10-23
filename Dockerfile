FROM node:21-alpine as build-ui

WORKDIR /ui
ENV PATH /ui/node_modules/.bin:$PATH
COPY ./web/package*.json ./

RUN npm ci --silent
COPY ./web ./

RUN npm run build

# build
FROM node:21-alpine as build

WORKDIR /build
RUN npm i -g typescript
COPY ./api/package*.json ./
RUN npm ci

COPY ./api ./

RUN npm run build

# app
FROM node:21-alpine as app

WORKDIR /app
COPY ./api/package.json ./api/package-lock.json ./
EXPOSE 80

ENV NPM_RUN_COMMAND=api

COPY --from=build /build/node_modules ./
COPY --from=build /build/.build/* ./
COPY --from=build /build/migrations/* ./migrations/
COPY --from=build-ui /ui/build ./ui

CMD ["sh", "-c", "npm run $NPM_RUN_COMMAND"]
