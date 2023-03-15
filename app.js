const express = require('express');
const { newEnforcer } = require('casbin');
require('dotenv').config()
const mongoose = require('mongoose')
// const { MongoClient, ServerApiVersion } = require('mongodb')

const pw = process.env.MONGODB_PW;
const dbUser = process.env.MONGODB_USER;
const mongoDbCluster = process.env.MONGODB_CLUSTER;
const url = `mongodb+srv://andiadmin:${pw}@cluster0.swbor.mongodb.net/casbinExampleApp?retryWrites=true&w=majority`;

/**
 * Connect to the mongoDB database (with mongoose)
 */
mongoose.set('strictQuery',false)
mongoose.connect(url)
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})
const Note = mongoose.model('Note', noteSchema)
const note = new Note({
  content: 'HTML is Easy!!!',
  important: true,
})
note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})


/**
 * Connect to the mongoDB database (without mongoose)
 */
// const client = new MongoClient(url2, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object

//   client.close();
// });


/**
 * Create the express app
 */
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
