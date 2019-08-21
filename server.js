const express = require('express');
var app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('view engine','pug');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://BeatMyBongos:MongosBongos@cluster0-u2tuz.mongodb.net/test?retryWrites=true&w=majority";
const ObjectId = require('mongodb').ObjectID;
const client = new MongoClient(uri,{useNewUrlParser : true, useUnifiedTopology: true});
const dbName = "webFinal";


const session = require('express-session');
app.use(session({
    secret:'I code good',
    cookie:{}
}));

var bcrypt = require('bcryptjs');



app.get('/',function (req,res){
    // console.log(getQuestionData());
    res.render('index');
});


app.get('/test',async function(req,res){
    // client.connect(err => {
    //     const collection = client.db(dbName).collection("questions");
    //     // perform actions on the collection object
    //     collection.insertOne(getQuestionData());
    //     client.close();
    //     res.redirect('/');
    //   });
    
    // getQuestionDataFromMongo();
    var user = await getUserByUserName("billys");
    console.log(user);
    res.render('index');

});

app.post('/register', async function(req,res){
    var person = req.body;
    person.password = bcrypt.hashSync(person.password);
    insertUser(person);

    //True or false
    console.log(bcrypt.compareSync("bob", person.password));
    
    //session crap
    
    console.log(person);
    res.redirect('/');
});

app.get('/register', function(req,res){
    res.render('register',getQuestions());
});


var server = app.listen(8080, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server running on "+host+":"+port);
})


//local file only
function getQuestions(){
    var obj = require(__dirname+"/questions.json");
    return obj;
}

//just gets the 'questions.json' in mongo
async function getQuestionDataFromMongo(){
    await client.connect();
    var questionsData = await client.db(dbName).collection("questions").findOne();
    await client.close();

    return questionsData;
}

async function insertUser(user){
    await client.connect();
    await client.db(dbName).collection("users").insertOne(user);
    await client.close();
}

async function getUserByUserName(name){
    var user = {};
    await client.connect();
    await client.db(dbName).collection("users").findOne({ username: name}).then(
        data => {user = data;},
        error => {console.log("Request failed: getUserByUserName: "+error);}
    );
    client.close();
    return user;
}
