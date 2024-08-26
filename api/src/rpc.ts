import { Server, ServerCredentials } from '@grpc/grpc-js';
import { PokeshopService } from './protos/pokeshop';
import PokemonRpcService from './services/pokemonRpc.service';
import { setupSequelize } from './utils/db';

const { RPC_PORT = 8082 } = process.env;

const startApp = async () => {
  await setupSequelize();

  const server = new Server();

  server.addService(PokeshopService, PokemonRpcService);

  server.bindAsync(`0.0.0.0:${RPC_PORT}`, ServerCredentials.createInsecure(), error => {
    if (error) {
      console.log(error)
    }

    console.log(`Starting server on port ${RPC_PORT}`);
    server.start();
  });
};

startApp();
