import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

class ImportPokemon {
  @IsNumber()
  @IsPositive()
  public id: number;
}

export default ImportPokemon;
