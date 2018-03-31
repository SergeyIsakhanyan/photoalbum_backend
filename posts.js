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

const tableName = 'posts'

router.get('', (req, res, next) => {
    knex(tableName)
        .whereExists(function () {
            this.select('*')
                .from(tableName)
                .whereRaw('user_id', req.user.id)
        })
        .then(resp => res.json(resp))
        .catch(err => next(err))
})

router.post('', (req, res, next) => {
    let post = Object.assign({}, req.body, { 'user_id': req.user.user_id })
    knex(tableName)
        .insert(post)
        .then(ids => knex(tableName)
            .join('users', `${tableName}.user_id`, '=', 'users.user_id')
            .where('post_id', ids[0])
            .then(resp => res.json(resp[0]))
            .catch(err => next(err))
        )
        .catch(err => next(err))
})

router.post('/post_id', (req, res, next) => {
    knex(tableName)
        .where('post_id', req.body.post_id)
        .update({
            title: req.body.title,
            description: req.body.description
        })
        .then(ids => knex(tableName)
            .where('post_id', req.body.post_id).select('*'))
        .then(resp => res.json(resp[0]))
        .catch(err => next(err))
})

router.delete('/post_id', (req, res, next) => {
    knex(tableName)
        .where('post_id', req.body.post_id)
        .del()
        .then(() => knex(tableName).select('*'))
        .then(resp => res.json(resp))
        .catch(err => next(err))
})

module.exports = router