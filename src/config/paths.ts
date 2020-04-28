/**
 * API configuration file
 */
export const API_CONFIG = '/api/configs/{ID}.yaml';

/**
 * APIs common configuration file
 */
export const API_CONFIG_COMMON = '/apis/common.yaml';

/**
 * APIs configuration directory
 */
export const API_CONFIG_DIR = '/apis/configs/';

/**
 * Client configuration file
 */
export const CLIENT_CONFIG = '/clients/configs/{ID}.yaml';

/**
 * Clients common configuration file
 */
export const CLIENT_CONFIG_COMMON = `/clients/common.yaml`;

/**
 * Clients configuration directory
 */
export const CLIENT_CONFIG_DIR = '/clients/configs/';

/**
 * Connection configuration file
 */
export const CONNECTION_CONFIG = '/connections/configs/{ID}.yaml';

/**
 * Connections common configuration
 */
export const CONNECTIONS_CONFIG_COMMON = '/connections/common.yaml';

/**
 * Connections configuration directory
 */
export const CONNECTIONS_CONFIG_DIR = '/connections/configs/';

/**
 * Connections custom database script directory
 */
export const CUSTOM_DATABASE_SCRIPT_DIR =
  '/connections/configs/{ID}/custom_database/';

/**
 * Connections custom database test directory
 */
export const CUSTOM_DATABASE_SCRIPT_TESTS_DIR =
  '/connections/configs/{ID}/custom_database/__test__/';

/**
 * Email template HTML path
 */
export const EMAIL_TEMPLATE = '/email_templates/templates/${ID}.html';

/**
 * Email templates configuration directory
 */
export const EMAIL_TEMPLATES_CONFIG = '/email_templates/config.yaml';

/**
 * Guardian configuration
 */
export const GUARDIAN_CONFIG = '/guardian.yaml';

/**
 * Rule file
 */
export const RULE = '/rules/{ID}.js';

/**
 * Rule configuration file
 */
export const RULES_CONFIG = '/rules/config.yaml';

/**
 * Rules directory
 */
export const RULES_DIR = '/rules/';

/**
 * Rules tests directory
 */
export const RULES_TESTS = '/rules/__test__/';

/**
 * Tenant configuration
 */
export const TENANT_CONFIG = '/tenant.yaml';

/**
 * Use directory configuration override
 */
export const USE_FILENAME = 'use.yaml';

/**
 * Working Directory
 */
export const WORKDIR = process.cwd();
