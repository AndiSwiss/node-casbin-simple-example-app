const express = require('express')
const router = express.Router()

/**
 * Routes
 */
router.get('/', (req, res) => {
  res.send('GET /allowlist');
});

router.post('/', (req, res) => {
  res.send('POST /allowlist');
});

router.get('/:id', (req, res) => {
  res.send(`GET /allowlist/* with params: ${JSON.stringify(req.params)}`);
});

router.patch('/:id', (req, res) => {
  res.send(`PATCH /allowlist/* with params: ${JSON.stringify(req.params)}`);
});

router.delete('/:id', (req, res) => {
  res.send(`DELETE /allowlist/* with params: ${JSON.stringify(req.params)}`);
});

module.exports = router;
