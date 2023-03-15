const { newEnforcer } = require('casbin')
const authMiddleware = async (req, res, next) => {
  const enforcer = await newEnforcer('./src/auth/model.conf', './src/auth/policy.csv');

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
