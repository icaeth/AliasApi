const app = require('express')();
const bodyParser = require('body-parser');
const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: 'fnAD7b1OMrACCOlGhhTNxC7c2rAgAsOdMEu4hrrG' })
const port = process.env.PORT || 4000

const {
    Ref,
    Paginate,
    Get,
    Match,
    Select,
    Index,
    Create,
    Collection,
    Join,
    Call,
    Function: Fn,
} = faunadb.query;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/tweet/:id', async (req, res) => {

    try {
        const doc = await client.query(
            Get(
                Ref(
                    Collection('tweets'),
                    req.params.id
                )
            )
        )
        res.send(doc)

    } catch (e) {
        console.log('catch error', e)
    }

});



app.post('/tweet', async (req, res) => {

    try {

        const user = req.body.user;
        const pass = req.body.pass;
        console.log(user)
        const data = {
            user, pass
        }

        const doc = await client.query(
            Create(
                Collection('tweets'),
                { data }
            )
        )

        res.send(doc)

    } catch (e) {
        console.log('catch error', e)

    }


});

app.get('/otro', async (req, res) => {
    const docs = await client.query(
        Get(
            Match(
                Index('users_by_name'),
                Call(Fn("getUser"), "escondida")
            )
        )
    )

    res.send(docs)
});


app.post('/relationship', async (req, res) => {


    const data = {
        follower: Call(Fn("getUser"), 'bob'),
        followee: Call(Fn("getUser"), 'fireship_dev')
    }
    const doc = await client.query(
        Create(
            Collection('relationships'),
            { data }
        )
    )

    res.send(doc)
});



app.get('/feed', async (req, res) => {
    const docs = await client.query(
        Paginate(
            Join(
                Match(
                    Index('followees_by_follower'),
                    Call(Fn("getUser"), 'bob')
                ),
                Index('tweets_by_user'),
            )
        )
    )

    res.send(docs)
});


app.listen(port, () => console.log('API on http://localhost:5000'))