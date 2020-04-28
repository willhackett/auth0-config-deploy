import yargs from 'yargs';

export interface CommandArgs {
  [x: string]: unknown;
  init?: boolean;
  deploy?: boolean;
  test?: boolean;
  dryRun?: boolean;
  auth0Domain?: string;
  auth0ClientId?: string;
  auth0ClientSecret?: string;
  baseDir?: string;
}

export default (): CommandArgs =>
  yargs.options({
    '--init': {
      type: 'boolean',
      alias: 'i',
      description:
        'Creates the directory structure based on current tenant config',
    },
    '--deploy': {
      type: 'boolean',
      alias: 'd',
      description: 'Tests and deploys the current configuration',
    },
    '--test': {
      type: 'boolean',
      description: 'Tests the current configuration',
    },
    '--dry-run': {
      type: 'boolean',
      description: 'Tests and provides verbose output of intended API calls',
    },
    '--auth0-domain': {
      type: 'string',
      description: 'Tenant domain ie. your-tenant.auth0.com',
    },
    '--auth0-clientId': {
      type: 'string',
      description: 'Application Client ID with Management API permission',
    },
    '--auth0-clientSecret': {
      type: 'string',
      description: 'Application Client Secret with Management API permission',
    },
    '--base-dir': {
      type: 'string',
      description: 'Path to base directory to look for tenant configuration',
    },
  }).argv;
