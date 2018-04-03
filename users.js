const express = require('express')
const app = express()
const router = express.Router()

let knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '12345',
        database: 'instagram'
    }
})

const tableName = 'users'

router.get('/:login', (req, res, next) => {
    knex(tableName)
        .select('name', 'user_id')
        .where('login', req.params.login)
        .then(([user]) => {
            if (user) {
                res.json(user)
            } else {
                throw new Error('no such user!')
            }
        })
        .catch(err => next(err))
})

router.post('', (req, res, next) => {
    knex(tableName)
        .insert(req.body)
        .then(ids => knex(tableName)
            .where('user_id', ids[0])
            .select('name', 'user_id')
            .then(resp => res.json(resp[0]))
            .catch(err => next(err))
        )
        .catch(err => next(err))
})

module.exports = router