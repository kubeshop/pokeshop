import { PokemonRepository } from '@pokemon/repositories//pokemon.repository';
import { Pokemon } from '@pokemon/repositories/pokemon.repository';
import { SequelizePokemonRepository } from './pokemon.sequelize.repository';

function getPokemonRepository(): PokemonRepository {
    return new SequelizePokemonRepository();
}

export {
    Pokemon,
    getPokemonRepository,
    PokemonRepository
}