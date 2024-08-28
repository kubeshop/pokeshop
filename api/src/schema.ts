import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Pokemon {
    id: Int
    name: String!
    type: String!
    isFeatured: Boolean!
    imageUrl: String
  }

  type PokemonList {
    items: [Pokemon]
    totalCount: Int
  }

  type ImportPokemon {
    id: Int!
  }

  type Query {
    getPokemonList(where: String, skip: Int, take: Int): PokemonList
  }

  type Mutation {
    createPokemon(name: String!, type: String!, isFeatured: Boolean!, imageUrl: String): Pokemon!
    importPokemon(id: Int!): ImportPokemon!
  }
`);

export default schema;
