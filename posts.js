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
        .where('user_id', req.user.id)
        .select('*')
        .then(resp => res.json(resp))
        .catch(err => next(err))
})

router.post('', (req, res, next) => {
    let post = Object.assign({}, req.body, {'user_id': req.user.id,'username': req.user.name})
    knex(tableName)
        .insert(post)
        .then(ids => knex(tableName)
            .where('id', ids[0]).select('*'))
        .then(resp => res.json(resp[0]))
        .catch(err => next(err))
})

router.post('/post_id', (req, res, next) => {
    knex(tableName)
        .where('id', req.body.id)
        .update({
            title: req.body.title,
            description: req.body.description
        })
        .then(ids => knex(tableName)
            .where('id', req.body.id).select('*'))
        .then(resp => res.json(resp[0]))
        .catch(err => next(err))
})

router.delete('/post_id', (req, res, next) => {
    knex(tableName)
        .where('id', req.body.id)
        .del()
        .then(() => knex(tableName).select('*'))
        .then(resp => res.json(resp))
        .catch(err => next(err))
})

module.exports = router