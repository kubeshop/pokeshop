import _ from 'lodash';
import { TPokemon } from '../../types/pokemon';
import PokemonCard from '../PokemonCard';
import * as S from './PokemonList.styled';

interface IProps {
  title: string;
  pokemonList: TPokemon[];
  totalCount: number;
  isFeaturedList?: boolean;
}

const PokemonList = ({ pokemonList, totalCount, title, isFeaturedList = false }: IProps) => {
  return (
    <>
      <S.TitleText>
        {title} - {totalCount}
      </S.TitleText>
      <S.PokemonList>
        {_.map(pokemonList, pokemon => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} isFeaturedList={isFeaturedList} />
        ))}
      </S.PokemonList>
    </>
  );
};

export default PokemonList;
