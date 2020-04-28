import { CommandArgs } from './commandArgs';

export interface EnvVars {
  AUTH0_DOMAIN?: string;
  AUTH0_CLIENT_ID?: string;
  AUTH0_CLIENT_SECRET?: string;
  BASE_DIR: string;
}

export default (argv: CommandArgs): EnvVars => ({
  AUTH0_DOMAIN: argv.auth0Domain || process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: argv.auth0ClientId || process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET:
    argv.auth0ClientSecret || process.env.AUTH0_CLIENT_SECRET,
  BASE_DIR: argv.baseDir || process.env.BASE_DIR || '/',
});
