import { CommandArgs } from './commandArgs';
import * as yup from 'yup';
import { ListrContext, ListrTask } from 'listr';
import { MainCtx } from '../main';

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

export default (ctx: MainCtx): void => {
  const { argv } = ctx;

  ctx.env = {
    AUTH0_DOMAIN: argv.auth0Domain || process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: argv.auth0ClientId || process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET:
      argv.auth0ClientSecret || process.env.AUTH0_CLIENT_SECRET,
    BASE_DIR: argv.baseDir || process.env.BASE_DIR || '/',
  };

  schema.validateSync(ctx.env);
};
