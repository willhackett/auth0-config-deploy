import { ManagementClient } from 'auth0';
import { MainCtx } from '../main';
import { ListrTaskWrapper } from 'listr';

export default async (ctx: MainCtx): Promise<any> => {
  const { env } = ctx;

  if (!env) {
    return new Error('Env is not defined.');
  }

  ctx.managementClient = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
  });
};
