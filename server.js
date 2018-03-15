const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const router = express.Router()
const port = 8081
let posts = [
    {
        username: 'Jack',
        id: 0,
        title: 'Hello',
        date: '2017-09-01T12:30:48',
        updated: '2017-09-01T12:30:48',
        description: 'This is the first image. Lorem ipsum dolor sit amet.',
        imageurl: 'https://travelsize.me/wp-content/uploads/2018/03/1520268443_maxresdefault-480x240.jpg',
    },
    {
        username: 'Anna',
        id: 1,
        title: '',
        date: '2018-01-01T08:30:10',
        updated: '2018-01-01T08:30:10',
        description: 'This is the first image.',
        imageurl: 'https://t3.ftcdn.net/jpg/01/33/92/36/240_F_133923669_az6zDEfhs2mw3Tkf3WxFjrKMnVCSyTRO.jpg',
    },
    {
        username: 'Walter',
        id: 2,
        title: 'Nature',
        date: '2018-02-13T22:40:38',
        updated: '2018-02-13T22:40:38',
        description: 'This is the first image. Lorem ipsum dolor sit amet.',
        imageurl: 'http://ironxiron.co.uk/wp-content/uploads/2018/01/Nature-6-2-480x240.jpg',
    }
]

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/api', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.json(posts)
})

app.post('/api/post', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    posts.push(req.body)
    res.send(req.body)
})

app.post(`/api/posts/:post_${posts.id}`, (req, res) => {
    posts.forEach(post => {
        if (post.id === req.body.id) {
            return Object.assign(post, req.body)
        }
        return post
    })
    console.log(posts)
    res.send(posts)
})

app.delete('/api/posts/:post_id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    postsCopy = posts.filter((post) => post.id !== req.body.id);
    posts = postsCopy
    res.json(posts)
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
