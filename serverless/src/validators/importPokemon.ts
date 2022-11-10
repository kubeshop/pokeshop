import { IsNumber, IsOptional, IsString } from 'class-validator';

class ImportPokemon {
  @IsNumber()
  @IsOptional()
  public id: number;

  @IsString()
  @IsOptional()
  public name: string;
}

export default ImportPokemon;
