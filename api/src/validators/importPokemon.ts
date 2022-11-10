import { IsNumber, IsPositive } from 'class-validator';

class ImportPokemon {
  @IsNumber()
  @IsPositive()
  public id: number;
}

export default ImportPokemon;
