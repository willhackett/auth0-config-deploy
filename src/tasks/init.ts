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
  RULE,
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

  /**
   * PREPARE DIRECTORY STRUCTURE
   * Create paths to directories so that file write can occur
   */
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

  /**
   * GETTING TENANT CONFIG
   * Store the yaml from `getTenantSettings`
   */
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

  /**
   * GETTING RULES
   * Store rules config and scripts
   */
  tasks.add({
    title: 'Getting rules',
    task: async () => {
      const rulesEnvironment = await client.getRulesConfigs();
      const rulesConfigs = await client.getRules();

      const rules = rulesConfigs.map(async (rule) => {
        if (!rule.name) {
          console.error(rule);
          throw new Error('Missing rule name');
        }
        const fileName = rule.name.replace(/\s/g, '_').replace(/\W/g, '');

        const filePath = RULE.replace('{ID}', fileName);

        await writeFile(path.join(baseDirectory, filePath), rule.script);

        return {
          name: rule.name,
          order: rule.order,
          enabled: rule.enabled ? true : false,
          file: fileName,
        };
      });

      const rulesConfig = {
        environment: rulesEnvironment,
        rules,
      };

      const rulesYAML = stringify(rulesConfig);

      console.log(rulesConfig, rules);

      return writeFile(path.join(baseDirectory, RULES_CONFIG), rulesYAML, {
        encoding: 'utf8',
        flag: 'w',
      });
    },
  });

  return tasks;
};
