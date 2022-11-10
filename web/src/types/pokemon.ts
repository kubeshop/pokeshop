import { components } from './generated';

export type TGeneratedSchemas = components['schemas'];

export type TPokemon = TGeneratedSchemas['Pokemon'];
export type TCreatePokemon = TGeneratedSchemas['CreatePokemonRequest'];
export type TImportPokemon = TGeneratedSchemas['ImportPokemonRequest'];
