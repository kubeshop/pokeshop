import Koa from 'koa';
import Router from '@koa/router';
import serve from 'koa-static';
import mount from 'koa-mount';
import KoaLogger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { resolve } from 'path';
import createHandler from '@pokemon/handlers/create.handler';
import getHandler from '@pokemon/handlers/get.handler';
import getByIdHandler from '@pokemon/handlers/getbyid.handler';
import featuredHandler from '@pokemon/handlers/featured.handler';
import importHandler from '@pokemon/handlers/import.handler';
import removeHandler from '@pokemon/handlers/remove.handler';
import searchHandler from '@pokemon/handlers/search.handler';
import updateHandler from '@pokemon/handlers/update.handler';
import healthcheckHandler from '@pokemon/handlers/healthcheck.handler';
import { setupSequelize } from '@pokemon/utils/db';
import { instrumentRoute } from '@pokemon/middlewares/instrumentation';

const { APP_PORT = 8081 } = process.env;

async function startApp() {
  const app = new Koa();
  const ui = new Koa();
  const router = new Router();

  await setupSequelize();

  const routeSetupFunctions = [
    healthcheckHandler, // should be first than getByIdHandler since both paths could collide
    createHandler,
    getHandler,
    getByIdHandler,
    featuredHandler,
    importHandler,
    removeHandler,
    searchHandler,
    updateHandler,
  ];

  for (const routeSetup of routeSetupFunctions) {
    routeSetup(router);
  }

  app
    .use(cors())
    .use(instrumentRoute())
    .use(bodyParser())
    .use(KoaLogger())
    .use(router.routes())
    .use(router.allowedMethods());

  ui.use(serve(resolve(__dirname, './ui')));
  app.use(mount('/', ui));

  console.log(`Starting server on port ${APP_PORT}`);
  app.listen(APP_PORT);
}

startApp();
