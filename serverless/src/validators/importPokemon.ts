import { IsNumber, IsOptional } from 'class-validator';

class ImportPokemon {
  @IsNumber()
  @IsOptional()
  public id: number;
}

export default ImportPokemon;
