const { newEnforcer } = require('casbin')
const { MongoAdapter } = require('casbin-mongodb-adapter')

require('dotenv').config()

const pw = process.env.MONGODB_PW;
const dbUser = process.env.MONGODB_USER;
const mongoDbCluster = process.env.MONGODB_CLUSTER;
const dbUrl = `mongodb+srv://${dbUser}:${pw}@${mongoDbCluster}/casbinExampleApp?retryWrites=true&w=majority`;

/**
 * Async singleton initialization of the enforcer
 * @returns {Promise<*>} enforcer
 */
const initEnforcer = async () => {
  if (!initEnforcer.enforcer) {

    // dbUrl, 'casbinExampleApp', 'casbinRules'
    const adapter = await MongoAdapter.newAdapter({
      uri: dbUrl,
      collection: 'casbinRules',
      database: 'casbinExampleApp',
    });

    const e = await newEnforcer('./src/auth/model.conf', adapter);


    await e.loadPolicy();
    /**
     # Routes
     # ======
     p, user, /allowlist, GET
     p, user, /users, GET
     p, user, /users/info, GET

     p, poweruser, /allowlist, POST
     p, poweruser, /allowlist/*, (GET)|(PATCH)|(DELETE)

     p, admin, /users, POST
     p, admin, /users/*, (GET)|(PATCH)|(DELETE)

     # Transitive groups
     # =================
     g, poweruser, user
     g, admin, poweruser

     # Users
     # =====
g, Victor, admin
g, Jack, poweruser
     g, Hugo, user
     */
    await e.addPolicy('user', '/allowlist', 'GET');
    await e.addPolicy('user', '/users', 'GET');
    await e.addPolicy('user', '/users/info', 'GET');
    await e.addPolicy('poweruser', '/allowlist', 'POST');
    await e.addPolicy('poweruser', '/allowlist/*', '(GET)|(PATCH)|(DELETE)');
    await e.addPolicy('admin', '/users', 'POST');
    await e.addPolicy('admin', '/users/*', '(GET)|(PATCH)|(DELETE)');
    await e.addGroupingPolicy('poweruser', 'user');
    await e.addGroupingPolicy('admin', 'poweruser');
    await e.addGroupingPolicy('Andi', 'admin');
    await e.addGroupingPolicy('Jonas', 'poweruser');
    await e.addGroupingPolicy('Hugo', 'user');

    console.log(`e.getAllActions() =`, await e.getAllActions())

    initEnforcer.enforcer = e;
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
