import Koa from 'koa';
import Router from '@koa/router';
import KoaLogger from 'koa-logger';
import bodyParse from 'koa-bodyparser';
import createHandler from '@pokemon/handlers/create.handler';
import getHandler from '@pokemon/handlers/get.handler';
import featuredHandler from '@pokemon/handlers/featured.handler';
import importHandler from '@pokemon/handlers/import.handler';
import removeHandler from '@pokemon/handlers/remove.handler';
import searchHandler from '@pokemon/handlers/search.handler';
import updateHandler from '@pokemon/handlers/update.handler';
import healthcheckHandler from '@pokemon/handlers/healthcheck.handler';
import { setupSequelize } from '@pokemon/utils/db';
import { instrumentRoute } from '@pokemon/middlewares/instrumentation';

const { APP_PORT = 80 } = process.env;

async function startApp() {
  const app = new Koa();
  const router = new Router();

  await setupSequelize();

  const routeSetupFunctions = [
    createHandler,
    getHandler,
    featuredHandler,
    importHandler,
    removeHandler,
    searchHandler,
    updateHandler,
    healthcheckHandler,
  ];

  for (const routeSetup of routeSetupFunctions) {
    routeSetup(router);
  }

  app.use(instrumentRoute()).use(bodyParse()).use(KoaLogger()).use(router.routes()).use(router.allowedMethods());

  console.log(`Starting server on port ${APP_PORT}`);
  app.listen(APP_PORT);
}

startApp();
