import { PrismaClient, Pokemon as PrismaPokemon } from '@prisma/client';
import { Pokemon, PokemonRepository, SearchOptions } from '@pokemon/repositories/pokemon.repository';

export class PrismaPokemonRepository implements PokemonRepository {
    private readonly prisma: PrismaClient;
  
    public constructor(prismaInstance: PrismaClient) {
      this.prisma = prismaInstance;
    }
  
    async create(pokemon: Pokemon): Promise<Pokemon> {
      const response = await this.prisma.pokemon.create({
        data: this.createPrismaArgumentsFromPokemon(pokemon),
      });
  
      return this.createPokemonFromPrismaModel(response);
    }
  
    async update(id: number, pokemon: Pokemon): Promise<Pokemon> {
      const updateObject = this.createPrismaArgumentsFromPokemon(pokemon);
      updateObject.id = undefined;
  
      const response = await this.prisma.pokemon.update({
        where: { id: id },
        data: updateObject,
      })
      
      return this.createPokemonFromPrismaModel(response);
    }
  
    async delete(pokemonId: number): Promise<Pokemon> {
      const response = await this.prisma.pokemon.delete({
        where: {id: pokemonId}
      });
  
      return this.createPokemonFromPrismaModel(response);
    }
  
    async findMany(options?: SearchOptions | undefined): Promise<Pokemon[]> {
      const response = await this.prisma.pokemon.findMany({...options});
      return response.map((prismaPokemon) => this.createPokemonFromPrismaModel(prismaPokemon));
    }
  
    async count(options?: SearchOptions | undefined): Promise<number> {
      return this.prisma.pokemon.count(options);
    }
  
    private createPrismaArgumentsFromPokemon(pokemon: Pokemon): any {
      return {
        id: pokemon.id,
        name: pokemon.name,
        type: pokemon.type,
        imageUrl: pokemon.imageUrl,
        isFeatured: pokemon.isFeatured
      }
    }
  
    private createPokemonFromPrismaModel(prismaModel: PrismaPokemon): Pokemon {
      const pokemon = new Pokemon();
      pokemon.id = prismaModel.id;
      pokemon.imageUrl = prismaModel.imageUrl || undefined;
      pokemon.isFeatured = !!prismaModel.isFeatured;
      pokemon.name = prismaModel.name;
      pokemon.type = prismaModel.type;
  
      return pokemon;
    }
  }