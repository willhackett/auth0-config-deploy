function disableResourceOwner(user, context, callback) {
  if (context.protocol === 'oauth2-resource-owner') {
    return callback(
      new UnauthorizedError('The resource owner endpoint cannot be used.'));
  }
  callback(null, user, context);
}