import Listr from 'listr';
import { stringify } from 'yaml';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { MainCtx } from '../main';
import {
  TENANT_CONFIG,
  API_CONFIG_DIR,
  CLIENT_CONFIG_DIR,
  CONNECTIONS_CONFIG_DIR,
  RULES_CONFIG,
  RULES_DIR,
} from '../config/paths';

const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const createDirectories = async (
  baseDirectory: string,
  directories: Array<string>
) =>
  Promise.all(
    directories.map(async (directory: string) => {
      const fullDirectoryPath = path.join(baseDirectory, directory);
      const directoryExists = await exists(fullDirectoryPath);
      if (!directoryExists) {
        return mkdir(fullDirectoryPath, { recursive: true });
      }
    })
  );

export default async (ctx: MainCtx) => {
  if (!ctx.env || !ctx.managementClient) {
    throw new Error('Init cannot run');
  }
  const baseDirectory = ctx.env.BASE_DIR;
  const client = ctx.managementClient;

  const tenantConfig = await client.getTenantSettings();

  const tasks = new Listr();

  tasks.add({
    title: 'Prepare directory structure',
    task: async () => {
      const directories = [
        API_CONFIG_DIR,
        CLIENT_CONFIG_DIR,
        CONNECTIONS_CONFIG_DIR,
        RULES_DIR,
      ];

      return createDirectories(baseDirectory, directories);
    },
  });

  tasks.add({
    title: 'Getting tenant config',
    task: async () => {
      const tenant = await client.getTenantSettings();
      const tenantYAML = stringify(tenant);

      return writeFile(path.join(baseDirectory, TENANT_CONFIG), tenantYAML, {
        encoding: 'utf8',
        flag: 'w',
      });
    },
  });

  tasks.add({
    title: 'Getting rules',
    task: async () => {
      const rulesConfig = await client.getRulesConfigs();
      const rulesYAML = stringify(rulesConfig);

      const rules = await client.getRules();

      console.log(rulesConfig, rules);

      return writeFile(path.join(baseDirectory, RULES_CONFIG), rulesYAML, {
        encoding: 'utf8',
        flag: 'w',
      });
    },
  });

  // tasks.add({
  //   title: 'Getting guardian config',
  //   ctx.configuration.guardian = await client.g
  // })

  return tasks;
};
