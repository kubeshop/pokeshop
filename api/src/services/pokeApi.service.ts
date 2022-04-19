import fetch from 'node-fetch';
import { getParentSpan, createSpan, runWithSpan } from '@pokemon/telemetry/tracing';

const { POKE_API_BASE_URL = '' } = process.env;

type TRawPokemon = {
  name: string;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string;
  };
};

const PokeAPIService = () => {
  const baseUrl = `${POKE_API_BASE_URL}/pokemon`;
  const defaultMethod = 'GET';

  return {
    async getPokemon(id: string) {
      const parentSpan = await getParentSpan();
      const span = await createSpan('PokeAPIService getPokemon', parentSpan);
      span.setAttribute('http.url', `${baseUrl}/${id}`);
      span.setAttribute('http.method', defaultMethod);
      const result = await runWithSpan(span, async () => {
        const response = await fetch(`${baseUrl}/${id}`, {
          method: defaultMethod,
        }); 

        const pokemon = (await response.json()) as TRawPokemon;
        span.setAttribute('http.response.headers', JSON.stringify(response.headers));
        span.setAttribute('http.response_content_length', JSON.stringify(pokemon).length);
        span.setAttribute('http.status_code', response.status);
  
        const { name, types, sprites } = pokemon;
  
        return {
          name,
          type: types.map(({ type }) => type.name).join(','),
          imageUrl: sprites.front_default,
        };
      });

      span.end();

      return result;
    },
  };
};

export default PokeAPIService;
