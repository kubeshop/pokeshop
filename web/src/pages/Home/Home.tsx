import Layout from '../../components/Layout';
import HomeActions from './HomeActions';
import * as S from './Home.styled';
import PokemonList from '../../components/PokemonList';
import usePokemonCrud from '../../hooks/usePokemonCrud';

const HomePage = () => {
  const {
    allPokemon: { data: { pokemonList = [], totalCount = 0 } = {} },
    featuredPokemon: { data: featuredPokemonList = [] },
  } = usePokemonCrud();

  return (
    <Layout>
      <S.Wrapper>
        <S.TitleText>Home Page</S.TitleText>
        <S.PageHeader>
          <HomeActions />
        </S.PageHeader>
        <PokemonList
          pokemonList={featuredPokemonList}
          totalCount={featuredPokemonList.length}
          title="Featured Pokémon"
          isFeaturedList
        />
        <PokemonList
          pokemonList={pokemonList}
          totalCount={totalCount}
          title="All Pokémon"
        />
      </S.Wrapper>
    </Layout>
  );
};

export default HomePage;
