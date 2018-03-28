const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('express-jwt')
const jwks = require('jwks-rsa')
const cors = require('cors')
const app = express()
const router = express.Router()
const port = 8081
const mysql = require('mysql')
let knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '12345',
        database: 'instagram'
    }
})

const postsTableName = 'posts'

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization')
    next()
})

const authCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://isakhanyan.auth0.com/.well-known/jwks.json"
    }),
    audience: 'https://photoalbum.com',
    issuer: "https://isakhanyan.auth0.com/",
    algorithms: ['RS256']
});



app.get('/api/posts', (req, res, next) => {
    knex(postsTableName).select('*')
        .then((response => res.json(response)))
        .catch(err => next(err))
})

app.post('/api/post', authCheck, (req, res, next) => {
    let post = Object.assign(req.body, { 'user_id': req.user.sub })
    knex(postsTableName).insert(post, 'id')
        .then(ids => knex(postsTableName).where('id', ids).select('*'))
        .then(response => res.json(response[0]))
        .catch(err => next(err))
})

app.post(`/api/posts/:post_id`, authCheck, (req, res, next) => {
    knex(postsTableName).where('id', req.body.id).andWhere('user_id', req.user.sub)
        .update({
            title: req.body.title,
            description: req.body.description
        })
        .then(ids => knex(postsTableName).where('id', req.body.id).select('*'))
        .then(response => res.json(response[0]))
        .catch(err => next(err))
})

app.delete('/api/posts/:post_id', authCheck, (req, res, next) => {
    knex(postsTableName).where('id', req.body.id).andWhere('user_id', req.user.sub).del()
        .then(() => knex(postsTableName).select('*'))
        .then(response => res.json(response))
        .catch(err => next(err))
})

app.get('/api/myposts', authCheck, (req, res) => {
    knex(postsTableName).where('user_id', req.user.sub).select('*')
        .then((response => res.json(response)))
        .catch(err => next(err))
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!' + err)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
