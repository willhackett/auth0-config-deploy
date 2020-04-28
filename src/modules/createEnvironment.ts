import * as yup from 'yup';
import { MainCtx } from '../main';
import { ListrTaskWrapper } from 'listr';

const schema = yup.object({
  AUTH0_DOMAIN: yup.string().required('Auth0 Tenant domain must be provided'),
  AUTH0_CLIENT_ID: yup
    .string()
    .required('Auth0 Application Client ID must be provided'),
  AUTH0_CLIENT_SECRET: yup
    .string()
    .required('Auth0 Application Client Secret must be provided'),
  BASE_DIR: yup.string(),
});

export type EnvVars = yup.InferType<typeof schema>;

export default async (ctx: MainCtx, list: ListrTaskWrapper<MainCtx>) => {
  const { argv } = ctx;

  const env = {
    AUTH0_DOMAIN: argv.auth0Domain || process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: argv.auth0ClientId || process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET:
      argv.auth0ClientSecret || process.env.AUTH0_CLIENT_SECRET,
    BASE_DIR: argv.baseDir || process.env.BASE_DIR || '/',
  };

  ctx.env = await schema.validate(env);

  return ctx.env;
};
