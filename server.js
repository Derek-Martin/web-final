const express = require('express');
var app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('view engine','pug');

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const client = new MongoClient(':::',{useNewUrlParser : true, useUnifiedTopology: true});

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


app.post('/register', function(req,res){
    var person = req.body;

    //create in mongo with hash

    //session crap

    console.log(person);
    res.redirect('/');
});

app.get('/register', function(req,res){

    res.render('register',getQuestionData());
});


var server = app.listen(8080, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server running on "+host+":"+port);
})


function getQuestionData(){
    var obj = require(__dirname+"/questions.json");
    return obj;
}