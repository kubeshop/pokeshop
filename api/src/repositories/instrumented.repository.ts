import { Pokemon, PokemonRepository, SearchOptions } from "@pokemon/repositories/pokemon.repository";
import { InstrumentedComponent } from "@pokemon/telemetry/instrumented.component";

export class InstrumentedPokemonRepository extends InstrumentedComponent implements PokemonRepository {

    private readonly repository: PokemonRepository;

    public constructor(repository: PokemonRepository) {
        super();
        this.repository = repository;
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