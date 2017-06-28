'use strict';

const google = require('googleapis');

exports.get = function get (req, res) {
  google.auth.getApplicationDefault(function (err, authClient, projectId) {
    if (err) {
      throw err;
    }
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/compute'
      ]);
    }
    const compute = google.compute({
      version: 'v1',
      auth: authClient
    });
    compute.zones.list({
      project: projectId,
      auth: authClient
    }, function (err, result) {
      res.status(200).send(result);
    });
  });
};
