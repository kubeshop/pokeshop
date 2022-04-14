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

EXPOSE 3000

COPY --from=build /build/.build/* ./
COPY --from=build /build/migrations/* ./migrations/
RUN ls
CMD ["npm", "run", "run-production"]