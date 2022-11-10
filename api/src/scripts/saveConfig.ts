import { resolve } from 'path';
import { writeFileSync } from 'fs';

const PATH = '../ui/config.json';
const { ZIPKIN_URL = '' } = process.env;

const saveConfig = () => {
  writeFileSync(
    resolve(__dirname, PATH),
    JSON.stringify({
      ZIPKIN_URL,
    })
  );
};

saveConfig();
