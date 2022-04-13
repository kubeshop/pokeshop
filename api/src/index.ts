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
import syncronizeHandler from '@pokemon/handlers/syncronize.handler';
import QueueService from '@pokemon/services/queue.service';
import { MESSAGE_GROUP } from '@pokemon/services/pokemonSyncronizer.service';

const app = new Koa();
const router = new Router();

const routeSetupFunctions = [
    createHandler,
    getHandler,
    featuredHandler,
    importHandler,
    removeHandler,
    searchHandler,
    updateHandler
];

for (const routeSetup of routeSetupFunctions) {
    routeSetup(router);
}

app
    .use(bodyParse())
    .use(KoaLogger())
    .use(router.routes())
    .use(router.allowedMethods())

// setup workers
const pokemonSyncronizationQueueService = QueueService(MESSAGE_GROUP);
syncronizeHandler(pokemonSyncronizationQueueService);

console.log('Starting server on port 3000');
app.listen(3000);