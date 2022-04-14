import { prisma } from '@pokemon/utils/db';
import { PrismaPokemonRepository } from '@pokemon/repositories/pokemon.prisma.repository';
import { PokemonRepository } from '@pokemon/repositories//pokemon.repository';
import { Pokemon } from '@pokemon/repositories/pokemon.repository';

function getPokemonRepository(): PokemonRepository {
    return new PrismaPokemonRepository(prisma);
}

export {
    Pokemon,
    getPokemonRepository,
    PokemonRepository
}