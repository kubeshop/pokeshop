import * as pg from 'pg';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';
import { PokemonModel } from '@pokemon/repositories/pokemon.sequelize.repository';


export let sequelize: Sequelize | undefined = undefined;

export async function setupSequelize() {
  const { DATABASE_URL = '' } = process.env;

  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    define: {
      timestamps: true,
      freezeTableName: true,
    },
  });

  sequelize.addModels([PokemonModel]);

  await runMigrations(sequelize);
}

async function runMigrations(sequelize) {
  const umzug = new Umzug({
    migrations: { glob: 'migrations/*.js' },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await umzug.up();
}
