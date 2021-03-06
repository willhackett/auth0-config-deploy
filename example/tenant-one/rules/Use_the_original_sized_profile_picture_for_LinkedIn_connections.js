function useOriginallinkedInProfilePicture(user, context, callback) {
  if (context.connection !== 'linkedin') {
    return callback(null, user, context);
  }

  const _ = require('lodash');
  const request = require('request');

  const liIdentity = _.find(user.identities, { connection: 'linkedin' });

  const options = {
    url: 'https://api.linkedin.com/v1/people/~/picture-urls::(original)?format=json',
    headers: {
      Authorization: 'Bearer ' + liIdentity.access_token
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) return callback(error);
    if (response.statusCode !== 200) return callback(new Error(body));

    if (body.values && body.values.length >= 1) {
      context.idToken.picture = body.values[0];
    }

    return callback(null, user, context);
  });
}