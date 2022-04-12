import Koa from 'koa';
import Router from '@koa/router';
import KoaLogger from 'koa-logger';
import bodyParse from 'koa-bodyparser';
import createHandler from './handlers/create.handler';
import getHandler from './handlers/get.handler';
import featuredHandler from './handlers/featured.handler';
import importHandler from './handlers/import.handler';
import removeHandler from './handlers/remove.handler';
import searchHandler from './handlers/search.handler';
import updateHandler from './handlers/update.handler';
import imageDownloaderHandler from './handlers/imageDownloader.handler';
import QueueService from './services/queue.service';
import { MESSAGE_GROUP } from './services/pokemonSyncronizer.service';

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
const imageDownloadQueueService = QueueService(MESSAGE_GROUP);
imageDownloaderHandler(imageDownloadQueueService);

console.log('Starting server on port 3000');
app.listen(3000);