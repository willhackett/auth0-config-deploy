import arg from 'arg';

const args = arg({
  '--help': Boolean,
  '--version': Boolean,
  // Configuration Params
  '--auth0-clientId': String,
  '--auth0-clientSecret': String,

  // Aliases
  '-c': '--auth0-clientId',
  '-s': '--auth0-clientSecret',
});

export default args;
