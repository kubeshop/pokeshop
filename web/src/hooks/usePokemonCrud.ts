import { useQuery, useMutation, useQueryClient } from 'react-query';
import PokemonGateway from '../gateways/pokemon';

const CACHE_KEY = 'pokemonList';
const FEATURED_CACHE_KEY = `${CACHE_KEY}/featured`;

const usePokemonCrud = () => {
  const queryClient = useQueryClient();
  const allPokemon = useQuery(CACHE_KEY, PokemonGateway.getAll, {
    refetchInterval: 500,
  });

  const featuredPokemon = useQuery(FEATURED_CACHE_KEY, PokemonGateway.getFeatured, {
    refetchInterval: 500,
  });

  const createPokemon = useMutation(PokemonGateway.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(CACHE_KEY);
      queryClient.invalidateQueries(FEATURED_CACHE_KEY);
    },
  });

  const importPokemon = useMutation(PokemonGateway.import, {
    onSuccess: () => {
      queryClient.invalidateQueries(CACHE_KEY);
      queryClient.invalidateQueries(FEATURED_CACHE_KEY);
    },
  });

  const deletePokemon = useMutation(PokemonGateway.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(CACHE_KEY);
    },
  });

  return { allPokemon, featuredPokemon, createPokemon, importPokemon, deletePokemon };
};

export default usePokemonCrud;
