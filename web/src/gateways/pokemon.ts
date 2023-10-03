import { TCreatePokemon, TImportPokemon, TPokemon } from '../types/pokemon';
import request from '../utils/request';

const BASE_API = `${document.baseURI}pokemon`;

const PokemonGateway = () => ({
  async getAll() {
    const { items: pokemonList, totalCount } = await request<{ items: TPokemon[]; totalCount: number }>({
      url: `${BASE_API}`,
    });

    return { pokemonList, totalCount };
  },
  async getFeatured() {
    const pokemonList = await request<TPokemon[]>({
      url: `${BASE_API}/featured`,
    });

    return pokemonList;
  },
  async create({ imageUrl, name, type, isFeatured = false }: TCreatePokemon) {
    const pokemon = await request<TPokemon>({
      url: `${BASE_API}`,
      method: 'POST',
      body: { imageUrl, name, type, isFeatured },
    });

    return pokemon;
  },
  async import({ id }: TImportPokemon) {
    const pokemon = await request<TPokemon>({
      url: `${BASE_API}/import`,
      method: 'POST',
      body: { id },
    });

    return pokemon;
  },
  async delete(id: number): Promise<void> {
    await request({
      url: `${BASE_API}/${id}`,
      method: 'DELETE',
    });
  },
});

export default PokemonGateway();
