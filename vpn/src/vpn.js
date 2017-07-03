'use strict';

// Third parties depencies
const google = require('googleapis');
const compute = google.compute('v1');

const createTunnel = (baseRequest, vpnTunnel) => {
  const request = Object.assign({}, baseRequest, { resource: vpnTunnel });
  compute.vpnTunnels.insert(request, (err, result) => {
    console.log('compute.vpnTunnels.insert status:', err || result);
    // Each route tells the associated network to send all traffic in the dest_range
    // through the VPN tunnel
    if (result) {
      vpnTunnel.routes.forEach((route) => {
        const request = Object.assign({}, baseRequest, {resource: route});
        compute.routes.insert(request, (err, result) => console.log('compute.routes.insert status:', err || result));
      });
    }
  });
};

exports.regenTunnel = (baseRequest, vpnTunnel) => {
  // The tunnel is responsible for encrypting and decrypting traffic exiting
  // and leaving its associated gateway
  const request = Object.assign({}, baseRequest, { vpnTunnel: vpnTunnel.name });
  compute.vpnTunnels.delete(request, (err, result) => {
    // Each route tells the associated network to send all traffic in the dest_range
    // through the VPN tunnel
    console.log('compute.vpnTunnels.delete status:', err || result);
    // TODO: Delete routes
    if (result) createTunnel(baseRequest, vpnTunnel)
  });
};

exports.createVpn = (baseRequest, vpnConfig) => {
  // Attach a VPN gateway to the network.
  const request = Object.assign({}, baseRequest, { resource: vpnConfig.resource });
  compute.targetVpnGateways.insert(request, (err, result) => {
    console.log('compute.targetVpnGateways.insert status:', err || result);
    if (result) {
      // The following sets of forwarding rules are used as a part of the IPSec protocol
      vpnConfig.forwardingRules.UDP.forEach((forwardingRule) => {
        const request = Object.assign({}, baseRequest, { resource: forwardingRule });
        compute.forwardingRules.insert(request, (err, result) => console.log('UDP compute.forwardingRules.insert status:', err || result));
      });
      // Forward IPSec traffic coming into our static IP to our VPN gateway.
      const request = Object.assign({}, baseRequest, { resource: vpnConfig.forwardingRules.ESP });
      compute.forwardingRules.insert(request, (err, result) => {
        console.log('ESP compute.forwardingRules.insert status:', err || result);
        if (result) vpnConfig.vpnTunnels.forEach(vpnTunnel => createTunnel(baseRequest, vpnTunnel));
      });
    }
  });
};
