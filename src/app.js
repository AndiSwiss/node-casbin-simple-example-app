const express = require('express');
const authMiddleware = require('./authMiddleware')
const mongodriver = require('./mongo-driver')

/**
 * Create the express app
 */
const app = express();
const port = 3000;

// Add these lines to enable body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authMiddleware);

/**
 * Routes
 */
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

app.get('/users', async (req, res) => {
  try {
    // get mongo client
    const mongoClient = await mongodriver.getConnection();

    const users = await mongodriver.getAllUsers(mongoClient);
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

// Create a new user
app.post('/users', async (req, res) => {
  try {
    // get body
    const body = req.body;

    console.log(`body =`, body)

    const user = {
      username: body.username,
      group: body.group,
    }

    // get mongo client
    const mongoClient = await mongodriver.getConnection();

    // create user
    const mongoresult = await mongodriver.createUser(mongoClient, user);
    res.send({
      "id": mongoresult.insertedId,
      "username": user.username,
      "group": user.group,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Patch user
 */
app.patch('/users/:id', async (req, res) => {
  try {
    // get body
    const body = req.body;

    // get mongo client
    const mongoClient = await mongodriver.getConnection();

    // get user id
    const userID = req.params.id;

    // get user
    const user = await mongodriver.getUser(mongoClient, userID);


    // update user
    if (body.username !== undefined) user.username = body.username;
    if (body.group !== undefined) user.group = body.group;

    console.log(`user =`, user)

    // update user
    const mongoresult = await mongodriver.updateUser(mongoClient, userID, user);
    res.send({
      "id": user._id,
      "username": user.username,
      "group": user.group,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Delete user
 */
app.delete('/users/:id', async (req, res) => {
  try {
    // get mongo client
    const mongoClient = await mongodriver.getConnection();

    // get user id
    const userID = req.params.id;

    // delete user
    const mongoresult = await mongodriver.deleteUser(mongoClient, userID);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Get user info
 * @openapi
 * /users/info:
 *  get:
 *  description: get user info
 *  produces:
 *  - application/json
 *  responses:
 *  200:
 *  description: user info
 *  403:
 *  description: forbidden
 */
app.get('/users/info', (req, res) => {
  res.send('GET /users/info');
});


/**
 * Start the server
 */
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
