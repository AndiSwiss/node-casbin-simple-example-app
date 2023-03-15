# Casbin example for securing endpoints in express




Tested with Postman. Example requests:

## Users and Powerusers
Header must contain `user-group: user` or `user-group: poweruser`
- GET http://localhost:3000/allowlist
- POST http://localhost:3000/allowlist
- GET http://localhost:3000/allowlist/42  (or any other id)

## Powerusers only
Header must contain `user-group: poweruser`
- POST http://localhost:3000/allowlist
- DELETE http://localhost:3000/allowlist/42  (or any other id)
