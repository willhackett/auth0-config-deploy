import { ManagementClient } from 'auth0';
import Listr from 'listr';

import parseCommandArgs, { CommandArgs } from './modules/commandArgs';
import createManagementClient from './modules/createManagementClient';
import createEnv, { EnvVars } from './modules/createEnvironment';
import tasks from './tasks';

export interface MainCtx {
  argv: CommandArgs;
  env?: EnvVars;
  managementClient?: ManagementClient;
}

async function main() {
  const argv = parseCommandArgs();

  const context = {
    argv,
  };

  const tasks = new Listr<MainCtx>();

  tasks.add({
    title: 'Creating environment',
    task: createEnv,
  });

  tasks.add({
    title: 'Creating management client',
    task: createManagementClient,
  });

  tasks.add({
    title: 'Loading configuration to memory',
    task: loadConfiguration,
    enabled: (ctx) => ctx.argv.init !== true,
  });

  tasks.add({
    title: 'Testing configuration',
    task: tasks.test,
    enabled: ({ arvg }) => [argv.test, argv.deploy, argv.dryRun].includes(true),
  });

  tasks.add({
    title: 'Deploying configuration',
    task: tasks.deploy,
    enabled: ({ argv }) => argv.deploy === true,
  });

  tasks
    .run(context)
    .catch(() => {
      process.exit(1);
    })
    .then(() => {
      process.exit(0);
    });
}
main();
