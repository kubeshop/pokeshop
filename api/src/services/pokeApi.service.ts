import fetch from 'node-fetch';
import { snakeCase } from 'lodash';
import { getParentSpan, createSpan, runWithSpan } from '@pokemon/telemetry/tracing';
import { Span, SpanKind } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { CustomTags } from '../constants/Tags';

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

export type TPokemon = {
  name: string;
  type: string;
  imageUrl: string;
}

class PokeAPIService {
  private readonly baseRoute: string = '/pokemon';
  private readonly baseUrl: string = `${POKE_API_BASE_URL}${this.baseRoute}`;

  async getPokemon(id: string): Promise<TPokemon> {
    const parentSpan = await getParentSpan();
    const span = await createSpan('HTTP GET pokeapi.pokemon', parentSpan, { kind: SpanKind.CLIENT });

    try {
      return await this.getPokemonFromAPi(id, span);
    } finally {
      span.end();
    }
  }

  private async getPokemonFromAPi(id: string, span: Span): Promise<TPokemon> {
    return await runWithSpan(span, async () => {
      span.setAttributes({
        [SemanticAttributes.HTTP_URL]: `${this.baseUrl}/${id}`,
        [SemanticAttributes.HTTP_METHOD]: 'GET',
        [SemanticAttributes.HTTP_ROUTE]: `${this.baseRoute}/${id}`,
        [SemanticAttributes.HTTP_SCHEME]: 'https',
      });

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
      });

      const pokemon = (await response.json()) as TRawPokemon;

      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: response.status,
        [SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH]: JSON.stringify(pokemon).length,
        [CustomTags.HTTP_RESPONSE_BODY]: JSON.stringify({ name: pokemon.name }),
      });

      Object.entries(response.headers).forEach(([key, value]) => {
        span.setAttribute(`${CustomTags.HTTP_RESPONSE_HEADER}.${snakeCase(key)}`, JSON.stringify([value]));
      });

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
