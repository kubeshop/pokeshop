import { prisma } from '../utils/db';
import CreatePokemon from '../validators/createPokemon';
import { validate } from '../middlewares/validation'
import { jsonResponse } from '../middlewares/response';

const create = async (ctx: { body: CreatePokemon }) => {
  const { name = '', type = '', isFeatured = false, imageUrl = '' } = ctx.body;

  const pokemon = await prisma.pokemon.create({
    data: {
      name,
      type,
      isFeatured,
    },
  });

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
