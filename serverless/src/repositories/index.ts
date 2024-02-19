import { PokemonRepository, Pokemon } from './pokemon.repository';
import { InstrumentedPokemonRepository } from './instrumented.repository';
import { PokemonModel, SequelizePokemonRepository } from './pokemon.sequelize.repository';

function getPokemonRepository(): PokemonRepository {
  const realPokemonRepository = new SequelizePokemonRepository();
  return new InstrumentedPokemonRepository(realPokemonRepository, PokemonModel);
}

export { Pokemon, getPokemonRepository, PokemonRepository };
