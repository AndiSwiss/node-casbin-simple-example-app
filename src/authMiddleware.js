const { newEnforcer } = require('casbin')

/**
 * Async singleton initialization of the enforcer
 * @returns {Promise<*>} enforcer
 */
const initEnforcer = async () => {
  if (!initEnforcer.enforcer) {
    initEnforcer.enforcer = await newEnforcer('./src/auth/model.conf', './src/auth/policy.csv');
    console.log('Enforcer initialized');
  }
  return initEnforcer.enforcer;
}

/**
 * Middleware for checking authorization
 * @param req request
 * @param res response
 * @param next next middleware
 */
const authMiddleware = async (req, res, next) => {
  // TODO: discuss if we should use non-singleton initialization??

  // non-singleton initialization of the enforcer
  // const enforcer = await newEnforcer('./src/auth/model.conf', './src/auth/policy.csv');

  // singleton initialization of the enforcer
  const enforcer = await initEnforcer();

  const user = req.get('user-group');
  const path = req.path;
  const method = req.method;

  const allowed = await enforcer.enforce(user, path, method);

  if (allowed) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
}

module.exports = authMiddleware;
