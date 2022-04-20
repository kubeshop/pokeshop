FROM node:alpine as build

WORKDIR /build
COPY package.json .
RUN npm i
RUN npm i -g typescript

COPY . .
RUN npm run build

FROM node:alpine as app

WORKDIR /app
COPY package.json .
RUN npm i --production

EXPOSE 80

ENV NPM_RUN_COMMAND=api

COPY --from=build /build/.build/* ./
COPY --from=build /build/migrations/* ./migrations/

CMD ["sh", "-c", "npm run $NPM_RUN_COMMAND"]