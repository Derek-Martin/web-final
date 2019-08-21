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

var bcrypt = require('bcryptjs');

const session = require('express-session');
app.use(session({
    secret:'I code good',
    cookie:{}
}));




app.get('/',function (req,res){
    // console.log(getQuestionData());
    var object = {admin:true};
    res.render('index',object);
});

app.get('/admin', async function(req,res){
    //if user has admin
        res.render('admin', await getAllUsers());    
    //else
        // res.redirect('/');
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
    // var user = await getUserByUserName("billys");
    // console.log(user);
    console.log(await getAllUsers());
    res.render('index');

});

app.get('/login',function(req,res){
    res.render('login');
});
app.post('/login',async function(req,res){
    var user = req.body;
    var other = await getUserByUserName(user.username);

    var valid = bcrypt.compareSync(user.password, other.password);
    if(valid){
        //TODO create session here
        res.redirect('/');
    }else{
        res.redirect('/login');
    }
});


app.get('/register',function(req,res){
    res.render('register',getQuestions());
});
app.post('/register', async function(req,res){
    var person = req.body;
    person.password = bcrypt.hashSync(person.password);
    insertUser(person);

    //TODO update mongo question values based off their answer
        //pull -> change -> update

    //TODO session crap

    //TODO Log them in
    
    // console.log(person);
    res.redirect('/');
});

app.get('/logout', function(req,res){

    //TODO kill session
    res.redirect('');
})

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
    client.close();

    return questionsData;
}

async function insertUser(user){
    await client.connect();
    await client.db(dbName).collection("users").insertOne(user);
    client.close();
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

async function getAllUsers(){
    await client.connect();
    var users ={};
    users['users'] = await client.db(dbName).collection("users").find().toArray();
    client.close();
    return users;
}