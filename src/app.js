const express = require('express');
const { authMiddleware } = require('./authMiddleware')
const userRouter = require('./routes/users');
const allowlistRouter = require('./routes/allowlist');

const app = express();
const port = 3003;

// Add these lines to enable body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authMiddleware);

app.use('/users', userRouter);
app.use('/allowlist', allowlistRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
