import fetch from 'node-fetch';

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
      const response = await fetch(`${baseUrl}/${id}`, {
        method: defaultMethod,
      });

      const { name, types, sprites } = (await response.json()) as TRawPokemon;

      return {
        name,
        type: types.map(({ type }) => type.name).join(','),
        imageUrl: sprites.front_default,
      };
    },
  };
};

export default PokeAPIService;
