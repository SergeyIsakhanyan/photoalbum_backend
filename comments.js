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

const tableName = 'comments'

router.put('', (req, res, next) => {
    let comment = Object.assign({}, req.body, { 'user_id': req.user.user_id })
    knex(tableName)
        .insert(comment)
        .then(ids => knex(tableName)
            .join('users', `${tableName}.user_id`, '=', 'users.user_id')
            .where('comment_id', ids[0])
            .select(`${tableName}.*`, 'users.user_id', 'users.name')
            .then(resp => res.json(resp[0]))
            .catch(err => next(err))
        )
        .catch(err => next(err))
})

router.post('/comment_id', (req, res, next) => {
    knex(tableName)
        .where('comment_id', req.body.comment_id)
        .andWhere('user_id', req.user.user_id)
        .update({
            text: req.body.text
        })
        .then(() => knex(tableName)
            .where('comment_id', req.body.comment_id)
            .select('*')
            .then(resp => res.json(resp[0]))
            .catch(err => next(err))
        )
        .catch(err => next(err))
})

router.delete('/comment_id', (req, res, next) => {
    const postId = req.get('Post_id')
    knex(tableName)
        .where('comment_id', req.body.comment_id)
        .andWhere('user_id', req.user.user_id)
        .del()
        .then(() => knex(tableName)
            .where('post_id', postId)
            .select('*')
            .then(resp => res.json(resp))
            .catch(err => next(err))
        )
        .catch(err => next(err))
})


module.exports = router
