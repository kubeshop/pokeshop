# build
FROM node:alpine as build

WORKDIR /build
RUN npm i -g typescript
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# app
FROM node:alpine as app

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 80

ENV NPM_RUN_COMMAND=api

COPY --from=build /build/.build/* ./
COPY --from=build /build/migrations/* ./migrations/

CMD ["sh", "-c", "npm run $NPM_RUN_COMMAND"]