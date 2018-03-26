const express = require('express')
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const cors = require('cors')
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


const postsTableName = 'posts'

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    next()
})

const authCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://isakhanyan.auth0.com/.well-known/jwks.json"
    }),
    audience: 'https://photoalbum.com',
    issuer: "https://isakhanyan.auth0.com/",
    algorithms: ['RS256']
});



app.get('/api', authCheck, (req, res) => {
    knex(postsTableName).select('*').then((response => res.json(response)))
})

app.post('/api/post', (req, res) => {
    knex(postsTableName).insert(req.body, 'id')
        .then(
            function (result, err) {
                if (err) console.log("Something wrong");
                knex(postsTableName).where('id', result).select('*')
                    .then(response => res.json(response[0]))
            }
        );
})

app.post(`/api/posts/:post_id`, (req, res) => {
    let sql = `UPDATE posts SET title = '${req.body.title}', description = '${req.body.description}', updated = '${req.body.updated}' WHERE id = ${req.body.id}`;
    connection.query(sql, function (err, result) {
        if (err) console.log("Something wrong");
        console.log("1 post updated");
        knex(postsTableName).where('id', req.body.id).select('*')
            .then(response => res.json(response[0]))
    })
})

app.delete('/api/posts/:post_id', (req, res) => {
    let sql = `DELETE FROM posts WHERE id = ${req.body.id}`;
    connection.query(sql, function (err) {
        if (err) console.log("Something wrong");
        console.log("1 post deleted");
        knex(postsTableName).select('*')
            .then(response => res.json(response))
    })
});


app.get('/api/myposts', authCheck, (req, res) => {
    knex('myposts').select('*').then((response => res.json(response)))
})

app.post('/api/mypost', (req, res) => {
    knex('myposts').insert(req.body, 'id')
        .then(
            function (result, err) {
                if (err) console.log("Something wrong!");
                knex('myposts').where('id', result).select('*')
                    .then(response => res.json(response[0]))
            }
        );
})

app.post(`/api/myposts/:post_id`, (req, res) => {
    let sql = `UPDATE myposts SET title = '${req.body.title}', description = '${req.body.description}', updated = '${req.body.updated}' WHERE id = ${req.body.id}`;
    connection.query(sql, function (err) {
        if (err) console.log("Something wrong");
        console.log('err'+err);
        console.log("1 post updated");
        knex('myposts').where('id', req.body.id).select('*')
            .then(response => res.json(response[0]))
    })
})

app.delete('/api/myposts/:post_id', (req, res) => {
    let sql = `DELETE FROM myposts WHERE id = ${req.body.id}`;
    connection.query(sql, function (err) {
        if (err) console.log(err);
        console.log("1 post deleted");
        knex('myposts').select('*')
            .then(response => res.json(response))
    })
});





app.listen(port, () => console.log(`Example app listening on port ${port}!`))
