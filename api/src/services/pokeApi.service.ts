import fetch from 'node-fetch';
import { getParentSpan, createSpan, runWithSpan } from '@pokemon/telemetry/tracing';
import { Span } from '@opentelemetry/api';

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

class PokeAPIService {
  private readonly baseUrl: string = `${POKE_API_BASE_URL}/pokemon`;

  async getPokemon(id: string) {
    const parentSpan = await getParentSpan();
    const span = await createSpan('get pokemon from pokeapi', parentSpan);
    span.setAttribute('http.method', "GET");
    span.setAttribute('http.url', `${this.baseUrl}/${id}`);
    
    try {
      return await this.getPokemonFromAPi(id, span);
    } finally {
      span.end();
    }
  }

  private async getPokemonFromAPi(id: string, span: Span) {
    return await runWithSpan(span, async () => {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "GET",
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

  }
}

export default PokeAPIService;
