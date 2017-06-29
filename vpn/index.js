'use strict';

// TODO: Errors handlers

const google = require('googleapis');
const compute = google.compute('v1');
const config = require('./config.json');

const authorize = (callback) => {
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

const createTunnels = (baseRequest, vpnTunnels) => {
  // The tunnel is responsible for encrypting and decrypting traffic exiting
  // and leaving its associated gateway
  vpnTunnels.forEach((vpnTunnel) => {
    const request = Object.assign({}, baseRequest, { resource: vpnTunnel });
    compute.vpnTunnels.insert(request, (err, result) => {
      // Each route tells the associated network to send all traffic in the dest_range
      // through the VPN tunnel
      if (result) {
        vpnTunnel.routes.forEach((route) => {
          const request = Object.assign({}, baseRequest, {resource: route});
          compute.routes.insert(request);
        });
      }
    });
  });
};

exports.get = (req, res) => {
  authorize((authClient, projectId) => {
    const testVpnConfig = config['test-vpn'];
    const baseRequest = {
      region: testVpnConfig.region,
      project: projectId,
      auth: authClient
    };
    // Check if a VPN gateway exists
    const request = Object.assign({}, baseRequest, { targetVpnGateway: testVpnConfig.resource.name });
    compute.targetVpnGateways.get(request, (err, result) => {
      if (result) {
        // TODO: Delete Tunnels
        // TODO: Create Tunnels
      } else {
        // Attach a VPN gateway to the network.
        const request = Object.assign({}, baseRequest, { resource: testVpnConfig.resource });
        compute.targetVpnGateways.insert(request, (err, result) => {
          if (result) {
            // The following sets of forwarding rules are used as a part of the IPSec protocol
            testVpnConfig.forwardingRules.UDP.forEach((forwardingRule) => {
              const request = Object.assign({}, baseRequest, { resource: forwardingRule });
              compute.forwardingRules.insert(request);
            });
            // Forward IPSec traffic coming into our static IP to our VPN gateway.
            const request = Object.assign({}, baseRequest, { resource: testVpnConfig.forwardingRules.ESP });
            compute.forwardingRules.insert(request, (err, result) => createTunnels(baseRequest, testVpnConfig.vpnTunnels));
          }
        });
      }
    });
    res.status(200).send({});
  });
};
