const express = require('express')
const { getEnforcer, allowedGroups } = require('../authMiddleware')
const router = express.Router()

/**
 * Get all users
 */
router.get('/', async (req, res) => {
  try {
    const e = await getEnforcer()
    let allUsers = await e.getGroupingPolicy()
    // Remove the (transitive) poweruser and admin from the list
    allUsers = allUsers.filter(p => p[0] !== 'poweruser' && p[0] !== 'admin')
    const users = allUsers.filter(p => p[1] === 'user').map(p => p[0])
    const powerUsers = allUsers.filter(p => p[1] === 'poweruser').map(p => p[0])
    const admins = allUsers.filter(p => p[1] === 'admin').map(p => p[0])
    res.send({ users, powerUsers, admins, allUsers })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal server error')
  }
})

/**
 * Create a new user
 */
router.post('/', async (req, res, next) => {
  try {
    // get body
    const body = req.body
    const username = body?.username
    const group = body?.group
    if (!username || !group) {
      res.status(400).send('Bad request')
      return
    }

    if (allowedGroups.indexOf(group) === -1) {
      res.status(400).send('Bad request, invalid group')
      return
    }

    const e = await getEnforcer()
    let success = await e.addGroupingPolicy(username, group)
    if (success) {
      res.status(200).send('OK')
      const policies = await e.getGroupingPolicy()
      console.log(`policies =`, policies)
    } else {
      // Nice: with e.getGroupingPolicy() we can check if the user was added
      // e.groupingPolicy is an array of arrays, where each array is a policy
      // e.g. [["alice", "admin"], ["bob", "admin"]]
      const policies = await e.getGroupingPolicy()
      console.log(`policies =`, policies)
      if (policies.some(p => p[0] === username && p[1] === group)) {
        res.status(200).send('OK, already added')
      } else {
        res.status(500).send('Internal server error, could not add user')
      }
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
})

/**
 * Patch user
 */
router.patch('/:id', async (req, res) => {
  res.status(501).send('PATCH user is not yet implemented')
})

/**
 * Delete user
 */
router.delete('/:id', async (req, res) => {
  res.status(501).send('DELETE user is not yet implemented')
})


/**
 * Get user info
 */
router.get('/info', (req, res) => {
  res.send('GET /users/info - not yet implemented')
})

/**
 * Get all routing policies
 */
router.get('/routing-policies', async (req, res) => {
  try {
    const e = await getEnforcer()
    const policies = await e.getPolicy()
    // sorted by route (second element)
    policies.sort((a, b) => a[1].localeCompare(b[1]))
    res.send({ policies })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal server error')
  }
})

module.exports = router
