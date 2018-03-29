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

router.get('/:id', (req, res, next) => {
    knex(tableName)
        .select('*')
        .where('id', req.params.id)
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
        .then(resp => res.json(resp[0]))
        .catch(err => next(err))
})

module.exports = router