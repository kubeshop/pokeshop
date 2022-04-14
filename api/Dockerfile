FROM node:alpine as build

WORKDIR /build
COPY package.json .
RUN npm i
RUN npm i -g typescript

COPY . .
RUN npm run build

FROM node:alpine as app

WORKDIR /app
COPY migrations .
COPY package.json .
RUN npm i --production

EXPOSE 3000

COPY --from=build /build/.build/* ./
RUN ls
RUN ls telemetry
CMD ["npm", "run", "run-production"]