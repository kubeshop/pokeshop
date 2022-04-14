import { PokemonRepository } from '@pokemon/repositories//pokemon.repository';
import { Pokemon } from '@pokemon/repositories/pokemon.repository';
import { InstrumentedPokemonRepository } from './instrumented.repository';
import { SequelizePokemonRepository } from './pokemon.sequelize.repository';

function getPokemonRepository(): PokemonRepository {
    const realPokemonRepository = new SequelizePokemonRepository();
    return new InstrumentedPokemonRepository(realPokemonRepository);
}

export {
    Pokemon,
    getPokemonRepository,
    PokemonRepository
}