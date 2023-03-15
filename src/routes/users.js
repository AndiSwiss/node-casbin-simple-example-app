const express = require('express')
const mongodriver = require('../mongo-driver')
const router = express.Router()


router.get('/', async (req, res) => {
  try {
    // get mongo client
    const mongoClient = await mongodriver.getConnection()

    const users = await mongodriver.getAllUsers(mongoClient)
    res.send(users)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal server error')
  }
})

// Create a new user
router.post('/', async (req, res) => {
  try {
    // get body
    const body = req.body

    console.log(`body =`, body)

    const user = {
      username: body.username,
      group: body.group
    }

    // get mongo client
    const mongoClient = await mongodriver.getConnection()

    // create user
    const mongoresult = await mongodriver.createUser(mongoClient, user)
    res.send({
      'id': mongoresult.insertedId,
      'username': user.username,
      'group': user.group
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal server error')
  }
})

/**
 * Patch user
 */
router.patch('/:id', async (req, res) => {
  try {
    // get body
    const body = req.body

    // get mongo client
    const mongoClient = await mongodriver.getConnection()

    // get user id
    const userID = req.params.id

    // get user
    const user = await mongodriver.getUser(mongoClient, userID)


    // update user
    if (body.username !== undefined) user.username = body.username
    if (body.group !== undefined) user.group = body.group

    console.log(`user =`, user)

    // update user
    await mongodriver.updateUser(mongoClient, userID, user)
    res.send({
      'id': user._id,
      'username': user.username,
      'group': user.group,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal server error')
  }
})

/**
 * Delete user
 */
router.delete('/:id', async (req, res) => {
  try {
    // get mongo client
    const mongoClient = await mongodriver.getConnection()

    // get user id
    const userID = req.params.id

    // delete user
    await mongodriver.deleteUser(mongoClient, userID)
    res.sendStatus(200)
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal server error')
  }
})


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
router.get('/info', (req, res) => {
  res.send('GET /users/info')
})


module.exports = router
