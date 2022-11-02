import { logError } from '@pokemon/handlers/logError';
import { jsonResponse } from '../middlewares/response';
import axios from "axios"

export const get =  async () => {
  // const { skip = '0', take = '20' } = ctx?.request?.query || {};
  // const query = { skip: +skip, take: +take };

  try {
    const todoItem = await axios('https://jsonplaceholder.typicode.com/todos/1');
    console.log(todoItem);
    // if (runMigration) {
    //   await setupSequelize();
    // }
    // const repository = getPokemonRepository();
    // const [items, totalCount] = await Promise.all([repository.findMany(query), repository.count()]);
    return {
      totalCount: 0,
      items: [],
    };
  } catch (e) {
    logError(e);
    return {
      totalCount: 0,
      items: [],
    };
  }
};

export default function setupRoute(router) {
  router.get('/pokemon', jsonResponse(200), get);
}
