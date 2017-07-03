'use strict';

// Third parties depencies
const google = require('googleapis');

exports.authorize = (callback) => {
  google.auth.getApplicationDefault((err, authClient, projectId) => {
    if (err) throw err;
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/compute'
      ]);
    }
    callback(authClient, projectId);
  });
};
