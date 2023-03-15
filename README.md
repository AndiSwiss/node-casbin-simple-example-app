# Casbin example for securing endpoints in express




Tested with Postman. Example requests:

## Users and Powerusers
Header must contain `user-group: user` or `user-group: poweruser`
- GET http://localhost:3000/users/info
- GET http://localhost:3000/allowlist

## Powerusers only
Header must contain `user-group: poweruser`
- POST http://localhost:3000/allowlist
- GET http://localhost:3000/allowlist/42  (or any other id)
- PATCH http://localhost:3000/allowlist/42  (or any other id)
- DELETE http://localhost:3000/allowlist/42  (or any other id)
