export type NodeEnv = 'development' | 'production' | 'test';

export interface AppEnv {
  readonly API_BASE_URL: string;
  readonly NODE_ENV: NodeEnv;
}

const DEFAULT_API_BASE_URL = 'https://pruebareactjs.test-class.com/Api/';

const readEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing environment variable: ${key}`);
};

const readNodeEnv = (): NodeEnv => {
  const raw = process.env['NODE_ENV'];
  if (raw === 'development' || raw === 'production' || raw === 'test') return raw;
  return 'development';
};

export const ENV: AppEnv = {
  API_BASE_URL: readEnv('REACT_APP_API_BASE_URL', DEFAULT_API_BASE_URL),
  NODE_ENV: readNodeEnv(),
};
