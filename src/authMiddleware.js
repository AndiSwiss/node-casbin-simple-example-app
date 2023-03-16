const { newEnforcer } = require('casbin')
const { MongoAdapter } = require('casbin-mongodb-adapter')

require('dotenv').config()

const pw = process.env.MONGODB_PW;
const dbUser = process.env.MONGODB_USER;
const mongoDbCluster = process.env.MONGODB_CLUSTER;
const dbUrl = `mongodb+srv://${dbUser}:${pw}@${mongoDbCluster}/casbinExampleApp?retryWrites=true&w=majority`;

const allowedGroups = ['user', 'poweruser', 'admin'];

/**
 * Async singleton initialization of the enforcer
 * @returns {Promise<*>} enforcer
 */
const getEnforcer = async () => {
  if (!getEnforcer.enforcer) {

    // dbUrl, 'casbinExampleApp', 'casbinRules'
    const adapter = await MongoAdapter.newAdapter({
      uri: dbUrl,
      collection: 'casbinRules',
      database: 'casbinExampleApp',
    });

    const e = await newEnforcer('./src/auth/model.conf', adapter);

    await e.loadPolicy();

    // Load default values if policy is empty
    const allPolicies = await e.getPolicy();
    if (allPolicies.length === 0) {
      await e.addPolicy('user', '/allowlist', 'GET');
      await e.addPolicy('user', '/users', 'GET');
      await e.addPolicy('user', '/users/info', 'GET');
      await e.addPolicy('poweruser', '/allowlist', 'POST');
      await e.addPolicy('poweruser', '/allowlist/*', '(GET)|(PATCH)|(DELETE)');
      await e.addPolicy('admin', '/users', 'POST');
      await e.addPolicy('admin', '/users/*', '(GET)|(PATCH)|(DELETE)');
      await e.addGroupingPolicy('poweruser', 'user');
      await e.addGroupingPolicy('admin', 'poweruser');
      await e.addGroupingPolicy('Victor', 'admin');
      await e.addGroupingPolicy('Jack', 'poweruser');
      await e.addGroupingPolicy('Hugo', 'user');
      console.log('Default policy loaded');
    }

    // TODO: change the endpoint  POST /users to await e.addGroupingPolicy(${username}, ${group});
    // TODO: same with endpoints PATCH / DELETE /users/:id
    // TODO: change endpoint GET /users to await e.getFilteredGroupingPolicy(1, ${group});  ??
    // TODO: change endpoint GET /users/:id to await e.getFilteredGroupingPolicy(0, ${username});
    //       NOTE: there is great code-completion for e.

    getEnforcer.enforcer = e;
    console.log('Enforcer initialized');
  }
  return getEnforcer.enforcer;
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
  const enforcer = await getEnforcer();

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

module.exports = { authMiddleware, getEnforcer, allowedGroups };
