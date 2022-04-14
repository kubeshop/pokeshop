import CreatePokemon from '@pokemon/validators/createPokemon';
import { validate } from '@pokemon/middlewares/validation'
import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository, Pokemon } from '@pokemon/repositories/pokemon.repository';

const create = async (ctx: { body: CreatePokemon }) => {
  const { name = '', type = '', isFeatured = false, imageUrl = '' } = ctx.body;
  const repository = getPokemonRepository();

  const pokemon = await repository.create(new Pokemon({
      name,
      type,
      isFeatured,
      imageUrl
    }),
  );

  return pokemon;
};

export default function setupRoute(router) {
  router.post(
    '/pokemon',
    validate(CreatePokemon),
    jsonResponse(201),
    create
  );
}
