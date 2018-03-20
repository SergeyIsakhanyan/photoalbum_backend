const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const router = express.Router()
const port = 8081
let mysql = require('mysql');
let knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '12345',
        database: 'instagram'
    }
});
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'instagram'
});

let posts = knex('posts').select('*').then(response => posts = response);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next()
})

app.get('/api', (req, res) => {
    res.json(posts)
})

app.post('/api/post', (req, res) => {
    let post = Object.assign({}, req.body, { id: posts[posts.length - 1].id + 1 })
    let sql = `INSERT INTO posts (username, id, title, date, updated, description, imageurl) VALUES ('${post.username}', ${post.id}, '${post.title}', '${post.date}', '${post.updated}', '${post.description}', '${post.imageurl}')`;
    connection.query(sql, function (err, result) {
        if (err) console.log("Something wrong");
        console.log("1 post inserted");
    });
    res.json(post)
})

app.post(`/api/posts/:post_id`, (req, res) => {
    let sql = `UPDATE posts SET title = '${req.body.title}', description = '${req.body.description}', updated = '${req.body.updated}' WHERE id = ${req.body.id}`;
    connection.query(sql, function (err, result) {
        if (err) console.log("Something wrong");
        console.log("1 post updated");
    })
    posts.forEach(post => {
        if (post.id === req.body.id) {
            return Object.assign(post, req.body)
        }
        return post
    })
    res.json(posts)
})

app.delete('/api/posts/:post_id', (req, res) => {
    let sql = `DELETE FROM posts WHERE id = ${req.body.id}`;
    connection.query(sql, function (err) {
        if (err) console.log("Something wrong");
        console.log("1 post deleted");
    })
    postsCopy = posts.filter((post) => post.id !== req.body.id);
    posts = postsCopy
    res.json(posts)
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
