import { Span } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { Pokemon, PokemonRepository, SearchOptions } from '@pokemon/repositories/pokemon.repository';
import { InstrumentedComponent } from '@pokemon/telemetry/instrumented.component';
import { CustomTags } from '../constants/Tags';
import { PokemonModel } from './pokemon.sequelize.repository';
import { sequelize } from '../utils/db';

const searchOptionsToJSON = (options?: SearchOptions) => {
  if (!options) {
    return JSON.stringify({});
  }

  const objectWithoutSymbols = replaceSymbolsInObject(options);
  return JSON.stringify(objectWithoutSymbols);
};

const replaceSymbolsInObject = function (object: Object): Object {
  const outputObject = {};
  const symbolKeys = Object.getOwnPropertySymbols(object);
  for (const symbol of symbolKeys) {
    outputObject[symbol.toString()] = object[symbol];
  }

  for (const key in object) {
    const value = object[key];
    if (typeof value === 'object') {
      outputObject[key] = replaceSymbolsInObject(value);
    } else if (typeof value === 'symbol') {
      outputObject[key] = value.toString();
    } else {
      outputObject[key] = value;
    }
  }

  return outputObject;
};

export class InstrumentedPokemonRepository extends InstrumentedComponent implements PokemonRepository {
  private readonly repository: PokemonRepository;
  private readonly model: typeof PokemonModel;

  public constructor(repository: PokemonRepository, model: typeof PokemonModel) {
    super();
    this.repository = repository;
    this.model = model;
  }

  getBaseAttributes() {
    const { DATABASE_URL = '' } = process.env;
    const { database, username } = sequelize?.config ?? {};
    const dialect = sequelize?.getDialect();

    return {
      [SemanticAttributes.DB_SYSTEM]: dialect,
      [SemanticAttributes.DB_NAME]: database,
      [SemanticAttributes.DB_USER]: username,
      [SemanticAttributes.DB_CONNECTION_STRING]: DATABASE_URL,
      [SemanticAttributes.DB_SQL_TABLE]: this.model.tableName,
    };
  }

  async create(pokemon: Pokemon): Promise<Pokemon> {
    return this.instrumentMethod('save pokemon on database', async (span: Span) => {
      const result = await this.repository.create(pokemon);
      const baseAttributes = this.getBaseAttributes();

      span.setAttributes({
        ...baseAttributes,
        [SemanticAttributes.DB_OPERATION]: 'create',
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }

  async update(id: number, pokemon: Pokemon): Promise<Pokemon> {
    return this.instrumentMethod('update pokemon on database', async (span: Span) => {
      const result = await this.repository.update(id, pokemon);

      const baseAttributes = this.getBaseAttributes();

      span.setAttributes({
        ...baseAttributes,
        [SemanticAttributes.DB_OPERATION]: 'update',
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }

  async delete(pokemonId: number): Promise<number> {
    return this.instrumentMethod('delete pokemon from database', async (span: Span) => {
      const affectedRows = await this.repository.delete(pokemonId);

      const baseAttributes = this.getBaseAttributes();

      span.setAttributes({
        ...baseAttributes,
        [SemanticAttributes.DB_OPERATION]: 'delete',
        [CustomTags.DB_RESULT]: JSON.stringify(affectedRows),
      });

      return affectedRows;
    });
  }

  findOne(id: number): Promise<Pokemon | null> {
    return this.instrumentMethod('find a pokemon from database', async (span: Span) => {
      const result = await this.repository.findOne(id);

      const baseAttributes = this.getBaseAttributes();

      span.setAttributes({
        ...baseAttributes,
        [SemanticAttributes.DB_OPERATION]: 'findOne',
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }

  async findMany(options?: SearchOptions): Promise<Pokemon[]> {
    return this.instrumentMethod('search pokemons from database', async (span: Span) => {
      const result = await this.repository.findMany(options);

      const baseAttributes = this.getBaseAttributes();

      span.setAttributes({
        ...baseAttributes,
        [SemanticAttributes.DB_OPERATION]: 'findMany',
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }

  async count(options?: SearchOptions): Promise<number> {
    return this.instrumentMethod('count pokemons from database', async (span: Span) => {
      const baseAttributes = await this.getBaseAttributes();

      const result = await this.repository.count(options);

      span.setAttributes({
        ...baseAttributes,
        [SemanticAttributes.DB_OPERATION]: 'count',
        [CustomTags.DB_PAYLOAD]: searchOptionsToJSON(options),
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }
}
