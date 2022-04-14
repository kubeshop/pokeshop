import { PrismaClient, Pokemon as PrismaPokemon } from '@prisma/client';
import { prisma } from '@pokemon/utils/db';

export class Pokemon {
  public id?: number;
  public name: string;
  public type: string;
  public isFeatured: boolean;
  public imageUrl?: string | null;

  public constructor(data?: object | undefined) {
    if (data) {
      this.id = data['id'];
      this.imageUrl = data['imageUrl'];
      this.isFeatured = data['isFeatured'];
      this.type = data['type'];
      this.name = data['name'];
    }
  }
}

export type SearchOptions = {
  where?: object | undefined,
  skip?: number | undefined,
  take?: number | undefined
}

export interface PokemonRepository {
  create(pokemon: Pokemon): Promise<Pokemon>;
  update(id: number, pokemon: Pokemon): Promise<Pokemon>;
  delete(pokemonId: number): Promise<Pokemon>;
  findMany(options?: SearchOptions | undefined): Promise<Pokemon[]>;
  count(options?: SearchOptions | undefined): Promise<number>;
}

export function getPokemonRepository(): PokemonRepository {
  return new PrismaPokemonRepository(prisma);
}

class PrismaPokemonRepository implements PokemonRepository {
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
    pokemon.imageUrl = prismaModel.imageUrl;
    pokemon.isFeatured = !!prismaModel.isFeatured;
    pokemon.name = prismaModel.name;
    pokemon.type = prismaModel.type;

    return pokemon;
  }
}