const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')
const authMiddleware = require('./auth/authMiddleware')

const pw = process.env.MONGODB_PW;
const dbUser = process.env.MONGODB_USER;
const mongoDbCluster = process.env.MONGODB_CLUSTER;
const url = `mongodb+srv://andiadmin:${pw}@cluster0.swbor.mongodb.net/casbinExampleApp?retryWrites=true&w=majority`;

/**
 * Connect to the mongoDB database (without mongoose)
 */
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect().then(() => {
  console.log('Connected to MongoDB');
  const db = client.db('casbinExampleApp');
  const users = db.collection('users');

  // add a user
  // users.insertOne({ name: 'Andi', group: 'admin' }).then((result) => {
  //   console.log('Added user:', result);
  // });

  // show all users
  users.find({}).toArray().then((result) => {
    console.log('All users:', result);
  })


}).catch(err => {
  console.log('Error connecting to MongoDB', err);
});

/**
 * Create the express app
 */
const app = express();
const port = 3000;


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

app.get('/users/info', (req, res) => {
  res.send('GET /users/info');
});


/**
 * Start the server
 */
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
