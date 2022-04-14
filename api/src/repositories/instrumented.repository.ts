import { Pokemon, PokemonRepository, SearchOptions } from "@pokemon/repositories/pokemon.repository";
import { createSpan, getParentSpan, runWithSpan } from "@pokemon/telemetry/tracing";

export class InstrumentedPokemonRepository implements PokemonRepository {

    private readonly repository: PokemonRepository;

    public constructor(repository: PokemonRepository) {
        this.repository = repository;
    }

    private async instrumentMethod<T>(spanName: string, innerMethod: () => Promise<T>): Promise<T> {
        const parentSpan = await getParentSpan();
        const span = await createSpan(spanName, parentSpan);
        try {
            return await runWithSpan(span, async () => {
                const result = await innerMethod()
                return result;
            });
        } catch (ex) {
            span.recordException(ex);
            throw ex;
        } finally {
            span.end();
        }
    }

    async create(pokemon: Pokemon): Promise<Pokemon> {
        return this.instrumentMethod('PokemonRepository create', async () => await this.repository.create(pokemon));
    }

    async update(id: number, pokemon: Pokemon): Promise<Pokemon> {
        return this.instrumentMethod('PokemonRepository update', async () => await this.repository.update(id, pokemon));
    }

    async delete(pokemonId: number): Promise<Pokemon> {
        return this.instrumentMethod('PokemonRepository delete', async () => await this.repository.delete(pokemonId));
    }

    async findMany(options?: SearchOptions): Promise<Pokemon[]> {
        return this.instrumentMethod('PokemonRepository findMany', async () => await this.repository.findMany(options));
    }

    async count(options?: SearchOptions): Promise<number> {
        return this.instrumentMethod('PokemonRepository count', async () => await this.repository.count(options));
    }

}