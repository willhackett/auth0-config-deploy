import { ManagementClient } from 'auth0';
import { MainCtx } from '../main';

export default (ctx: MainCtx): void => {
  const { env } = ctx;

  if (!env) {
    throw new Error('Env is not defined.');
  }

  ctx.managementClient = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
  });
};
