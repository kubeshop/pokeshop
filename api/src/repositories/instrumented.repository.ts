import { Span } from "@opentelemetry/api";
import { Pokemon, PokemonRepository, SearchOptions } from "@pokemon/repositories/pokemon.repository";
import { InstrumentedComponent } from "@pokemon/telemetry/instrumented.component";

const searchOptionsToJSON = (options?: SearchOptions) => {
    if (!options) {
        return JSON.stringify({});
    }

    const objectWithoutSymbols = replaceSymbolsInObject(options);
    return JSON.stringify(objectWithoutSymbols);
}

const replaceSymbolsInObject = function(object: Object): Object {
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
}

export class InstrumentedPokemonRepository extends InstrumentedComponent implements PokemonRepository {

    private readonly repository: PokemonRepository;

    public constructor(repository: PokemonRepository) {
        super();
        this.repository = repository;
    }

    async create(pokemon: Pokemon): Promise<Pokemon> {
        return this.instrumentMethod('save pokemon on database', async (span: Span) => {
            span.setAttribute('db.repository.operation', 'create');
            span.setAttribute('db.repository.params.payload', JSON.stringify(pokemon));

            const result = await this.repository.create(pokemon)
            span.setAttribute('db.repository.result', JSON.stringify(result));

            return result;
        });
    }

    async update(id: number, pokemon: Pokemon): Promise<Pokemon> {
        return this.instrumentMethod('update pokemon on database', async (span: Span) => {
            span.setAttribute('db.repository.operation', 'update');
            span.setAttribute('db.repository.params.id', id);
            span.setAttribute('db.repository.params.payload', JSON.stringify(pokemon));

            const result = await this.repository.update(id, pokemon)
            span.setAttribute('db.repository.result', JSON.stringify(result));

            return result;
        });
    }

    async delete(pokemonId: number): Promise<number> {
        return this.instrumentMethod('delete pokemon from database', async (span: Span) => {
            span.setAttribute('db.repository.operation', 'delete');
            span.setAttribute('db.repository.params.id', pokemonId);

            const affectedRows = await this.repository.delete(pokemonId);
            span.setAttribute('db.repository.affected_rows', affectedRows);

            return affectedRows;
        });
    }

    findOne(id: number): Promise<Pokemon | null> {
        return this.instrumentMethod('find a pokemon from database', async (span: Span) => {
            span.setAttribute('db.repository.operation', 'findOne');
            span.setAttribute('db.repository.params.id', id);

            const result = await this.repository.findOne(id);
            span.setAttribute('db.repository.result', JSON.stringify(result));

            return result;
        });
    }

    async findMany(options?: SearchOptions): Promise<Pokemon[]> {
        return this.instrumentMethod('search pokemons from database', async (span: Span) => {
            span.setAttribute('db.repository.operation', 'findMany');
            span.setAttribute('db.repository.params.payload', searchOptionsToJSON(options));

            const result = await this.repository.findMany(options);
            span.setAttribute('db.repository.result', JSON.stringify(result));

            return result;
        });
    }

    async count(options?: SearchOptions): Promise<number> {
        return this.instrumentMethod('count pokemons from database', async (span: Span) => {
            span.setAttribute('db.repository.operation', 'count');
            span.setAttribute('db.repository.params.payload', searchOptionsToJSON(options));

            const result = await this.repository.count(options);
            span.setAttribute('db.repository.result', result);

            return result;
        });
    }

}