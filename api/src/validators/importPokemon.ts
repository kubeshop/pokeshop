import { IsNumber, IsPositive } from 'class-validator';

class ImportPokemon {
  @IsNumber()
  @IsPositive()
  public id: number;

  public ignoreCache: boolean;
}

export default ImportPokemon;
