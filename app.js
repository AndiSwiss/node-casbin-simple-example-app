const express = require('express');
const { newEnforcer } = require('casbin');

const app = express();
const port = 3000;

const authMiddleware = async (req, res, next) => {
  const enforcer = await newEnforcer('model.conf', 'policy.csv');

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

app.use(authMiddleware);

app.get('/allowlist', (req, res) => {
  res.send('GET /allowlist');
});

app.post('/allowlist', (req, res) => {
  res.send('POST /allowlist');
});

app.get('/allowlist/:id', (req, res) => {
  res.send(`GET /allowlist/* with params: ${JSON.stringify(req.params)}`);
});

app.patch('/allowlist/:id', (req, res) => {
  res.send(`PATCH /allowlist/* with params: ${JSON.stringify(req.params)}`);
});

app.delete('/allowlist/:id', (req, res) => {
  res.send(`DELETE /allowlist/* with params: ${JSON.stringify(req.params)}`);
});

app.get('/users/info', (req, res) => {
  res.send('GET /users/info');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
