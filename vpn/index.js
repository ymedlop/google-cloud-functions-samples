'use strict';

const config = require('./secrets/config.json');
const google = require('googleapis');
const compute = google.compute('v1');

exports.get = function get (req, res) {
  const request = {
     project: config.PROJECT,
     region: 'us-central1',
     vpnTunnel: 'wito',
     auth: config.COMPUTE_API_KEY
   };
  compute.vpnTunnels.get(request, function(err, response) {
     if (err) {
       console.log(err);
       return;
     }
     console.log(JSON.stringify(response, null, 2));
   });
  res.status(200).send({});
};
