import { Column, PrimaryKey, Model, Table, AutoIncrement, AllowNull, Default } from 'sequelize-typescript';
import { Pokemon, PokemonRepository, SearchOptions } from '@pokemon/repositories/pokemon.repository';

@Table({
  schema: 'public',
  tableName: 'pokemon',
})
export class PokemonModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  public id?: number;

  @Column
  public name: string;

  @Column
  public type: string;

  @AllowNull
  @Column
  public imageUrl?: string;

  @Default(false)
  @Column
  public isFeatured: boolean;
}

export class SequelizePokemonRepository implements PokemonRepository {
  async create(pokemon: Pokemon): Promise<Pokemon> {
    const model = this.createModelFromPokemon(pokemon);
    await model.save();

    return this.createPokemonFromModel(model);
  }

  async update(id: number, pokemon: Pokemon): Promise<Pokemon> {
    const newData = { ...pokemon };
    delete newData.id;
    await PokemonModel.update({ ...newData }, { where: { id: id } });

    const model = await PokemonModel.findOne({
      where: { id: id },
    });
    return this.createPokemonFromModel(model!!);
  }

  async delete(id: number): Promise<number> {
    return await PokemonModel.destroy({ where: { id: id } });
  }

  async findOne(id: number): Promise<Pokemon | null> {
    const model = await PokemonModel.findOne({ where: { id: id } });
    if (!model) {
      return null;
    }

    return this.createPokemonFromModel(model);
  }

  async findMany(options?: SearchOptions): Promise<Pokemon[]> {
    const models = await PokemonModel.findAll({
      where: { ...options?.where },
      offset: options?.skip,
      limit: options?.take,
    });

    return models.map(model => this.createPokemonFromModel(model));
  }

  async count(options?: SearchOptions): Promise<number> {
    return await PokemonModel.count({
      where: { ...options?.where },
    });
  }

  private createModelFromPokemon(pokemon: Pokemon): PokemonModel {
    const model = new PokemonModel();
    model.id = pokemon.id;
    model.name = pokemon.name;
    model.type = pokemon.type;
    model.isFeatured = pokemon.isFeatured;
    model.imageUrl = pokemon.imageUrl;

    return model;
  }

  private createPokemonFromModel(model: PokemonModel): Pokemon {
    return new Pokemon({
      id: model.id,
      name: model.name,
      type: model.type,
      isFeatured: model.isFeatured,
      imageUrl: model.imageUrl,
    });
  }
}
