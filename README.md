# auth0-config-deploy

Configure, test &amp; deploy Auth0 config via the Management API

## Arguments

### Usage

| Argument                | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `--init`                | Creates the directory structure based on current tenant config |
| `--deploy` (Alias `-d`) | Tests and deploys the current configuration                    |
| `--test` (Alias `-t`)   | Tests the current configuration                                |
| `--dry-run`             | Tests and provides verbose output of intended API calls        |

### Configuration

Configuration can be passed in directly to the CLI or via environment variables. This is useful for
deploying via a pipeline.

| Argument               | Default                   | Purpose                                                              |
| ---------------------- | ------------------------- | -------------------------------------------------------------------- |
| `--auth0-domain`       | `env.AUTH0_DOMAIN`        | Supplies the Auth0 Domain to use                                     |
| `--auth0-clientId`     | `env.AUTH0_CLIENT_ID`     | Client ID to access Management API                                   |
| `--auth0-clientSecret` | `env.AUTH0_CLIENT_SECRET` | Client Secret to access Management API                               |
| `--base-dir`           | `/`                       | Specify the base dir for the tenant, useful for multi-tenant configs |

## Providing Secrets to Config

An `env` object is provided to yaml via template strings, so to splat environment variables into your configuration
you can simple nest them within the configuration.

For example:

```yaml
someVariable: '{{ env.SOME_ENV_VAR }}
```

Conditionals are also available, for documentation on this please refer to: XYZ LIBRARY HERE

## YAML Anchors & Aliases

TODO: Add a HOW TO with Anchors & Aliases

## Additional Helpers

These helpers do not exist on the Management API but are provided here to make configuration simpler.

### `enabled_realms` in Client Configurations

This option allows you to automatically populate the enabled `clientId` list on the connection instead of supplying the entire list via the `enabled_clients` option within connections config.

### `use` for common configurations between tenants

Place `use.yaml` file in the directory containing a path to the common directory.

This applies to all configurations except for `clients/configs` as these are specific to the tenant.

For example:

```yaml
path: '/common/rules/'
```

Placing this file at `rules/use.yaml` will prompt the CLI to use the rules within `/common/rules/`.

### Excluding Liquid Syntax from a section of config

Auth0 also allows liquid syntax within some fields, so if you intend to use this you can wrap it with `{{***}}` and `{{/***}}` to prevent syntax parsing.

## Directory Structure

```
root
├── tenant.yaml
├── guardian.yaml
├── clients
│   ├── configs
│   │   └── {clientId}.yaml // A file exists per clientId
│   └── common.yaml // Common store for client use with YAML Anchors & Aliases
├── rules
│   ├── __test__
│   │   └── {rule}.test.js // Testing of the rules using a similar sandbox to Auth0
│   ├── {rule}.js // Rule matching the environment configuration
│   └── config.yaml // Rule ordering and environment configuration
├── connections
│   └── {realm}
│       ├── config.yaml
│       └── custom_database
│           ├── __test__
│           │   └── {script}.test.js
│           └── {script}.js
├── apis
│   ├── configs
│   │   └── {apiId}.yaml
│   └── common.yaml // Common store for API use with YAML Anchors & Aliases
├── email_templates
    ├── {templateId}
    │   ├── index.html // Email Template
    │   └── config.yaml // Config for email template
    └── common.yaml // Common store for email templates use with YAML Anchors & Aliases
```
