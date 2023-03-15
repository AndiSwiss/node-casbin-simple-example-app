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
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.get('/users/info', (req, res) => {
  res.send('GET /users/info');
});


/**
 * Start the server
 */
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
