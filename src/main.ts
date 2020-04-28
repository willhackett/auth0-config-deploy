import parseCommandArgs from './modules/commandArgs';
import createManagementClient from './modules/managementClient';
import createEnv from './modules/env';
import tasks from './tasks';

async function main() {
  const argv = parseCommandArgs();
  const env = createEnv(argv);
  const managementClient = createManagementClient(env);

  console.log(env);
}
main();
