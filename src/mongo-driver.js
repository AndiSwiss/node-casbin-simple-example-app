/**
 * MongoDB driver - similar to our app
 */
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID
require('dotenv').config()

const pw = process.env.MONGODB_PW;
const dbUser = process.env.MONGODB_USER;
const mongoDbCluster = process.env.MONGODB_CLUSTER;
const dbUrl = `mongodb+srv://${dbUser}:${pw}@${mongoDbCluster}/casbinExampleApp?retryWrites=true&w=majority`;

/**
 * Connect to the mongoDB database (without mongoose)
 */
const MONGO_CONNECTION_POOL = new MongoClient(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).connect();

/**
 * returns a connection from the connection pool
 */
async function getConnection() {
  return MONGO_CONNECTION_POOL
}


function mongoID(id){
  if (typeof id==='object'){
    return id
  }
  if(ObjectId.isValid(id)){
    return ObjectId.createFromHexString(id)
  }
  return ObjectId(id)
}

/**
 * get all users from the database
 * @param connection the connection to the database
 * @returns {Promise<*>} all users
 */
async function getAllUsers(connection) {
  return await connection
    .db('casbinExampleApp')
    .collection('users')
    .find({})
    .toArray();
}

/**
 * get a user by id from the database
 * @param connection the connection to the database
 * @param id the id of the user
 * @returns {Promise<*>} the user
 */
async function getUser(connection, id) {
  return await connection
    .db('casbinExampleApp')
    .collection('users')
    .findOne({ _id: mongoID(id)});
}

/**
 * update a user by id in the database
 */
async function updateUser(connection, id, user) {
  return await connection
    .db('casbinExampleApp')
    .collection('users')
    .replaceOne({ _id: mongoID(id) }, user);
}

/**
 * delete a user by id in the database
 */
async function deleteUser(connection, id) {
  return await connection
    .db('casbinExampleApp')
    .collection('users')
    .deleteOne({ _id: mongoID(id) });
}

/**
 * Create a new user
 * @param connection the connection to the database
 * @param user the user to create
 * @returns {Promise<*>} the created user
 */
async function createUser(connection, user) {
  return await connection
    .db('casbinExampleApp')
    .collection('users')
    .insertOne(user);
}

module.exports = {
  getConnection,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
