'use strict';

const whitelist = [
  'YWRtaW46c3VwZXJzZWNyZXQ='
];

const authBasic = (req, res, next, cb) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const parts = authorization.split(' ');
    const scheme = parts[0];
    const token = parts[1];
    if (scheme === 'Basic' && whitelist.some(item => token === item)) {
      return next(cb(req, res));
    }
  }
  return res.status(401).end('Unauthorized');
};

const helloFn = (req, res) => res.status(200).send({ msg: 'Test' });

exports.HttpBasicTest = (req, res, next) => authBasic(req, res, next, helloFn);