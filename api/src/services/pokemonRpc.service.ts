import { instrumentRpcServer } from '../middlewares/instrumentation';
import { PokeshopServer } from '../protos/pokeshop';
import { getPokemonRepository, Pokemon } from '../repositories';
import PokeAPIService from './pokeApi.service';
import PokemonSyncronizer from './pokemonSyncronizer.service';

const pokemonSyncronizer = PokemonSyncronizer(PokeAPIService);
const repository = getPokemonRepository();

const PokemonRpcService = (): PokeshopServer => ({
  async getPokemonList({ request: { take = 20, skip = 0 } }, callback) {
    const [items, totalCount] = await Promise.all([repository.findMany({ take, skip }), repository.count()]);

    callback(null, { items, totalCount });
  },
  async createPokemon({ request: { name, type, isFeatured, imageUrl } }, callback) {
    const pokemon = await repository.create(
      new Pokemon({
        name,
        type,
        isFeatured,
        imageUrl,
      })
    );

    callback(null, pokemon);
  },
  async importPokemon({ request: { id, ignoreCache }}, callback) {
    await pokemonSyncronizer.queue({
      id,
      ignoreCache: ignoreCache ?? false,
    });

    callback(null, { id });
  },
});

export default instrumentRpcServer(PokemonRpcService(), 'Pokeshop');
