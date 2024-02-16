import createHandler from './handlers/create.handler';
import getHandler from './handlers/get.handler';
import featuredHandler from './handlers/featured.handler';
import removeHandler from './handlers/remove.handler';
import importPokemonHandler from './handlers/import.handler';
import searchHandler from './handlers/search.handler';
import composeHandlers from './middlewares/middleware';
import worker from './handlers/worker.handler';

const { create, get, update, remove, importPokemon, search, featured } = composeHandlers({
  create: createHandler,
  get: getHandler,
  remove: removeHandler,
  importPokemon: importPokemonHandler,
  search: searchHandler,
  featured: featuredHandler,
});

export { create, get, update, remove, importPokemon, featured, search, worker };
