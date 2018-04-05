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

const tableName = 'posts'

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'User-Id, Post_id')
    next()
})

function authCheck(req, res, next) {
    const userId = req.get('User-Id')
    if (!userId) {
        next(new Error('no userId!'))
    }
    knex('users')
        .where('user_id', userId)
        .then(([user]) => {
            if (user) {
                req.user = user
                next()
            } else {
                next(new Error('no such user!'))
            }
        })
}

app.use('/api/myposts', authCheck, require('./myposts'))
app.use('/api/users', require('./users'))
app.use('/api/comments', authCheck, require('./comments'))

app.get('/api/posts', (req, res, next) => {
    knex(tableName)
        .join('users', `${tableName}.user_id`, '=', 'users.user_id')
        .select('posts.*', 'users.user_id', 'users.name')
        .then((response => res.json(response)))
        .catch(err => next(err))
})
app.get('/api/comments', (req, res, next) => {
    const postId = req.get('Post_id')
    knex('comments')
        .where('post_id', postId)
        .join('users', 'comments.user_id', '=', 'users.user_id')
        .select('text', 'comment_id', 'name', 'post_id', 'users.user_id')
        .then(resp => res.json(resp))
        .catch(err => next(err))
})


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!' + err)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
