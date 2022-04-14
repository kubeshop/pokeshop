import { PokemonModel } from '@pokemon/repositories/pokemon.sequelize.repository';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';

export async function setupSequelize() {
    const { DATABASE_URL = '' } = process.env;

    const sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres'
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