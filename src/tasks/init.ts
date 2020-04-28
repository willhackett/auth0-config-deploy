import Listr from 'listr';
import { stringify } from 'yaml';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { omit, forEach } from 'lodash/fp';

import { MainCtx } from '../main';
import {
  TENANT_CONFIG,
  API_CONFIG_DIR,
  CLIENT_CONFIG_DIR,
  CONNECTIONS_CONFIG_DIR,
  RULES_CONFIG,
  RULES_DIR,
  RULE,
  CONNECTIONS_CONFIG_COMMON,
  CONNECTION_CONFIG,
  CLIENT_CONFIG,
  CUSTOM_DATABASE_SCRIPT_DIR,
  CUSTOM_DATABASE_SCRIPT,
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

      const rules = await Promise.all(
        rulesConfigs.map(async (rule) => {
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
        })
      );

      const environment: { [index: string]: string } = {};

      rulesEnvironment.forEach((config: { key: string }) => {
        environment[config.key] = `{{ env.${config.key} }}`;
      });

      const rulesConfig = {
        environment,
        rules,
      };

      const rulesYAML = stringify(rulesConfig);

      return writeFile(path.join(baseDirectory, RULES_CONFIG), rulesYAML, {
        encoding: 'utf8',
        flag: 'w',
      });
    },
  });

  /**
   * GETTING CONNECTIONS
   * Store connection information
   */
  tasks.add({
    title: 'Getting connections',
    task: async (ctx: MainCtx) => {
      ctx.connections = {};

      const connectionsConfig = await client.getConnections();

      await writeFile(path.join(baseDirectory, CONNECTIONS_CONFIG_COMMON), '', {
        encoding: 'utf8',
        flag: 'w',
      });

      return Promise.all(
        connectionsConfig.map(async ({ id, realms, ...connection }) => {
          if (!connection.name) {
            console.warn(`Skipping ${id} because the connection has no name.`);
            return;
          }

          const connectionName = connection.name;

          if (ctx.connections) {
            // Store in context for later use
            ctx.connections[connectionName] = connection;
          }

          const filePath = CONNECTION_CONFIG.replace('{ID}', connectionName);

          const connectionYAML = stringify(connection);

          if (id) {
            const connectionConfig = await client.getConnection({ id });
            if (connection.options.customScripts) {
              await Promise.all(
                Object.keys(connection.options.customScripts).map(
                  async (script) => {
                    const source = connection.options.customScripts[script];

                    const filePath = CUSTOM_DATABASE_SCRIPT.replace(
                      '{ID}',
                      connectionName
                    ).replace('{SCRIPT}', script);

                    return writeFile(
                      path.join(baseDirectory, filePath),
                      source,
                      {
                        encoding: 'utf8',
                        flag: 'w',
                      }
                    );
                  }
                )
              );
            }
          }

          const omitConnectionOptions = omit(['customScripts']);

          connection.options = omitConnectionOptions(connection.options);

          await createDirectories(baseDirectory, [
            CUSTOM_DATABASE_SCRIPT_DIR.replace('{ID}', connectionName),
          ]);

          return writeFile(path.join(baseDirectory, filePath), connectionYAML, {
            encoding: 'utf8',
            flag: 'w',
          });
        })
      );
    },
  });

  /**
   * GETTING CLIENTS
   * Store client information
   */
  tasks.add({
    title: 'Getting clients',
    task: async (ctx: MainCtx) => {
      const clients = await client.getClients();

      const omitClientFields = omit([
        'tenant',
        'client_secret',
        'signing_keys',
      ]);

      return Promise.all(
        clients.map(async (client) => {
          if (!client.client_id) {
            console.warn(
              `Skipping client ${client.name} as client_id is empty.`
            );
            return;
          }

          const clientId = client.client_id;

          const filePath = CLIENT_CONFIG.replace('{ID}', clientId);
          const clientConfig = omitClientFields(client);
          const enabledRealms: Array<string> = [];

          if (ctx.connections) {
            forEach((connection) => {
              if (!connection.name) {
                return;
              }

              if (connection.enabled_clients?.includes(clientId)) {
                enabledRealms.push(connection.name);
              }
            }, ctx.connections);
          }

          const clientYAML = stringify({
            ...clientConfig,
            enabled_realms: enabledRealms,
          });

          return writeFile(path.join(baseDirectory, filePath), clientYAML, {
            encoding: 'utf8',
            flag: 'w',
          });
        })
      );
    },
  });

  /**
   *
   */

  return tasks;
};
