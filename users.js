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

router.post('/:login', (req, res, next) => {
    knex(tableName)
        .where('login', req.params.login)
        .andWhere('password', req.body.password)
        .select('name', 'user_id', 'login', 'profile_pic_url')
        .then(resp => res.json(resp[0]))
        .catch(err => next(err))
})

router.put('', (req, res, next) => {
    knex(tableName)
        .insert(req.body)
        .then(ids => knex(tableName)
            .where('user_id', ids[0])
            .select('name', 'user_id', 'login', 'profile_pic_url')
            .then(resp => res.json(resp[0]))
            .catch(err => next(err))
        )
        .catch(err => next(err))
})

router.post('/user', (req, res, next) => {
    knex(tableName)
        .where('user_id',req.user.user_id)
        .update({
            name: req.body.name,
            profile_pic_url: picUrl
        })
        .then(ids => knex(tableName)
            .where('user_id', req.body.user_id).select('*'))
        .then(resp => res.json(resp[0]))
        .catch(err => next(err))
})

module.exports = router