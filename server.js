const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const router = express.Router()
const port = 8081
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

function authCheck(req, res, next) {
    const userId = req.get('User-Id')
    if (!userId) {
        next(new Error('no userId!'))
    }
    knex('users')
        .where('id', userId)
        .then(([ user ]) => {
            if (user) {
                req.user = user
                next()
            } else {
                next(new Error('no such user!'))
            }
        })
}

app.get('/api/posts', authCheck, (req, res, next) => {
    knex(postsTableName).select('*')
        .then((response => res.json(response)))
        .catch(err => next(err))
})

app.post('/api/posts', authCheck, (req, res, next) => {
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

app.use('/api/users', require('./users'))

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!' + err)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
