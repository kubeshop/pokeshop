import { Pokemon, PokemonRepository } from '@pokemon/repositories/pokemon.repository';
import { SequelizePokemonRepository } from '@pokemon/repositories/pokemon.sequelize.repository';

function getPokemonRepository(): PokemonRepository {
  return new SequelizePokemonRepository();
}

export { Pokemon, getPokemonRepository, PokemonRepository };
