import request from './request';

interface IConfig {
  SERVICE_NAME: string;
}

export let config: IConfig | undefined = undefined;

const loadConfig = async () => {
  if (config) return config;

  config = await request<IConfig>({ url: '/config.json' });

  return config;
};

export default loadConfig;
