import { ManagementClient } from 'auth0';
import Listr, { ListrTask } from 'listr';

import parseCommandArgs, { CommandArgs } from './modules/commandArgs';
import createManagementClient from './modules/managementClient';
import createEnv, { EnvVars } from './modules/env';
import tasks from './tasks';

export interface MainCtx {
  argv: CommandArgs;
  env?: EnvVars;
  managementClient?: ManagementClient;
}

type MainTask = ListrTask<MainCtx>;

async function main() {
  const argv = parseCommandArgs();

  const task = new Listr<MainTask>([
    {
      title: 'Creating environment',
      task: createEnv,
    },
    {
      title: 'Creating management client',
      task: createManagementClient,
    },
  ]);

  try {
    task.run({ argv });
  } catch (e) {
    console.error(e);
  }
}
main();
