import { resolve } from 'path';
import { writeFileSync } from 'fs';

const PATH = '../ui/config.json';
const { SERVICE_NAME = '', HTTP_COLLECTOR_ENDPOINT = '' } = process.env;

const saveConfig = () => {
  writeFileSync(
    resolve(__dirname, PATH),
    JSON.stringify({
      HTTP_COLLECTOR_ENDPOINT,
      SERVICE_NAME,
    })
  );
};

saveConfig();
