import request from './request';

interface IConfig {
  ZIPKIN_URL: string;
}

export let config: IConfig | undefined = undefined;

const loadConfig = async () => {
  if (config) return config;

  config = await request<IConfig>({ url: '/config.json' });

  return config;
};

export default loadConfig;
