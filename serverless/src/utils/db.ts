import { PokemonModel } from '../repositories/pokemon.sequelize.repository';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';

export let sequelize: Sequelize | undefined = undefined;

export async function setupSequelize() {
  const { DATABASE_URL = '' } = process.env;

  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

  sequelize.addModels([PokemonModel]);

  await runMigrations(sequelize);
}

async function runMigrations(sequelize) {
  const umzug = new Umzug({
    migrations: { glob: './src/migrations/*.js' },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await umzug.up();
}
