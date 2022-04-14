export class Pokemon {
  public id?: number;
  public name: string;
  public type: string;
  public isFeatured: boolean;
  public imageUrl?: string;

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
  delete(pokemonId: number): Promise<void>;
  findOne(id: number): Promise<Pokemon | null>
  findMany(options?: SearchOptions | undefined): Promise<Pokemon[]>;
  count(options?: SearchOptions | undefined): Promise<number>;
}