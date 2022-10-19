import { logError } from '@pokemon/handlers/logError';
import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository, Pokemon } from '@pokemon/repositories';
import { setupSequelize } from '@pokemon/utils/db';
import CreatePokemon from '@pokemon/validators/createPokemon';
import { validate } from '../middlewares/validation';

export const create = (runMigration = false) => async (ctx: { body: CreatePokemon }) => {
  try {
    const { name = '', type = '', isFeatured = false, imageUrl = '' } = ctx.body;
    if (runMigration) await setupSequelize()
    const repository = getPokemonRepository();
    return repository.create(
      new Pokemon({
        name,
        type,
        isFeatured,
        imageUrl,
      })
    );
  } catch (e) {
    logError(e);
    throw e;
  }
};

export default function setupRoute(router) {
  router.post('/pokemon', jsonResponse(201), validate(CreatePokemon), create());
}
