'use strict';

// Third parties depencies
const google = require('googleapis');
const compute = google.compute('v1');
// Functions dependencies
const auth = require('./auth.js');
const vpn = require('./vpn.js');
const config = require('../config.json');

// Check VPN Method ( create or regen ).
exports.checkVpn = (req, res) => {
  auth.authorize((authClient, projectId) => {
    // TODO: vpn as a parameter to handle diferents vpns configurations
    const vpnConfig = config['test-vpn'];
    const baseRequest = {
      region: vpnConfig.region,
      project: projectId,
      auth: authClient
    };
    // Check if a VPN gateway exists
    const request = Object.assign({}, baseRequest, { targetVpnGateway: vpnConfig.resource.name });
    compute.targetVpnGateways.get(request, (err, result) => {
      if (result) vpnConfig.vpnTunnels.forEach(vpnTunnel => vpn.regenTunnel(baseRequest, vpnTunnel));
      else vpn.createVpn(baseRequest, vpnConfig);
    });
    res.status(200).send({ msg: 'Starting task to check vpn status' });
  });
};

// Create VPN Method
exports.createVpn = (req, res) => {
  auth.authorize((authClient, projectId) => {
    // TODO: vpn as a parameter to handle diferents vpns configurations
    const vpnConfig = config['test-vpn'];
    const baseRequest = {
      region: vpnConfig.region,
      project: projectId,
      auth: authClient
    };
    vpn.createVpn(baseRequest, vpnConfig);
    res.status(200).send({ msg: 'Starting task to create vpn' });
  });
};

// Regenerate VPN Method
exports.regenVpn = (req, res) => {
  auth.authorize((authClient, projectId) => {
    // TODO: vpn as a parameter to handle diferents vpns configurations
    const vpnConfig = config['test-vpn'];
    const baseRequest = {
      region: vpnConfig.region,
      project: projectId,
      auth: authClient
    };
    vpnConfig.vpnTunnels.forEach(vpnTunnel => vpn.regenTunnel(baseRequest, vpnTunnel));
    res.status(200).send({ msg: 'Starting task to regen the vpn' });
  });
};
