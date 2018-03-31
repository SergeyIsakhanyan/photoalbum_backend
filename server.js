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
    res.setHeader('Access-Control-Allow-Headers', 'User-Id')
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

app.use('/api/posts', authCheck, require('./posts'))
app.use('/api/users', require('./users'))

app.get('/api/allposts', (req, res) => {
    knex(tableName).select('*')
        .then((response => res.json(response)))
        .catch(err => next(err))
})


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!' + err)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
