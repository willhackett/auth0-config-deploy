import { ManagementClient, Connection } from 'auth0';
import Listr from 'listr';

import parseCommandArgs, { CommandArgs } from './modules/commandArgs';
import createManagementClient from './modules/createManagementClient';
import createEnv, { EnvVars } from './modules/createEnvironment';

import init from './tasks/init';
import test from './tasks/test';
import deploy from './tasks/deploy';

export interface MainCtx {
  argv: CommandArgs;
  env?: EnvVars;
  managementClient?: ManagementClient;
  connections?: {
    [index: string]: Connection;
  };
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
    title: 'Importing configuration',
    task: init,
    enabled: (ctx) => ctx.argv.init === true,
  });

  // tasks.add({
  //   title: 'Testing configuration',
  //   task: test,
  //   enabled: ({ arvg }) => [argv.test, argv.deploy, argv.dryRun].includes(true),
  // });

  // tasks.add({
  //   title: 'Deploying configuration',
  //   task: deploy,
  //   enabled: ({ argv }) => argv.deploy === true,
  // });

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
