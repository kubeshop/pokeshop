import { SQSHandler } from 'aws-lambda';
import PokeAPIService from '../services/pokeApi.service';
import PokemonSynchronizer from '../services/pokemonSynchronizer.service';
import db from '../middlewares/db';

const pokeApiService = new PokeAPIService();
const syncronizer = PokemonSynchronizer(pokeApiService);

const isDbReady = db();

const worker: SQSHandler = async ({ Records }) => {
  await isDbReady;

  await Promise.all(
    Records.map(async message => {
      await syncronizer.sync(message);
    })
  );
};

export default worker;
