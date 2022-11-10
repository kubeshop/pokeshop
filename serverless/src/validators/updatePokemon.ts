import { IsBoolean, IsOptional, IsString } from 'class-validator';

class UpdatePokemon {
  @IsString()
  @IsOptional()
  public name: string;

  @IsString()
  @IsOptional()
  public type: string;

  @IsBoolean()
  @IsOptional()
  public isFeatured: boolean;
}

export default UpdatePokemon;
