/* eslint-disable @typescript-eslint/no-explicit-any */

let env: Record<string, any> = {};

if (global.process) {
  env = global.process.env;
}

export default {
  apiBase: env.BACKEND_URL ? `${env.BACKEND_URL}/api` : 'http://localhost:8000/api',
};
