const express = require("express");
var app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.set("view engine", "pug");

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://BeatMyBongos:MongosBongos@cluster0-u2tuz.mongodb.net/test?retryWrites=true&w=majority";
const ObjectId = require("mongodb").ObjectID;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = "webFinal";

var bcrypt = require("bcryptjs");

const session = require("express-session");
app.use(
    session({
        secret: "I code good",
        cookie: {}
    })
);

app.get("/", async function(req, res) {
    var model = getSessionObject(req);
    try {
        var questionArray = await getQuestionDataFromMongo();
        if(questionArray==null||questionArray==undefined)throw new Exception();
        model["questions"] = questionArray.questions;
        res.render("index", model);
    } catch {
        console.log("Mongo is only whitelisted at Neumont, this website can only be connected to there");
        res.render("bruh");
    }
});

app.get("/admin", async function(req, res) {
    var obj = getSessionObject(req);
    obj["users"] = await getAllUsers();

    if (obj.admin) {
        res.render("admin", obj);
    } else {
        res.redirect("/");
    }
});

app.get("/test", async function(req, res) {
    res.render("index");
});

app.get("/login", function(req, res) {
    res.render("login");
});
app.post("/login", async function(req, res) {
    var user = req.body;
    var other = await getUserByUserName(user.username);
    if (other == null) {
        res.redirect("/login");
        return;
    }

    var valid = bcrypt.compareSync(user.password, other.password);
    if (valid && other.status == "active") {
        req.session.user = other;
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
});

app.get("/register", function(req, res) {
    res.render("register", getQuestions());
});
app.post("/register", async function(req, res) {
    var person = req.body;
    person.status = "active";
    person.password = bcrypt.hashSync(person.password);
    insertUser(person);

    var answers = [person.answer0, person.answer1, person.answer2];
    updateMongoQuestions(answers);

    req.session.user = person;

    res.redirect("/");
});

app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});

app.get("/profile", function(req, res) {
    var obj = getSessionObject(req);
    obj["user"] = req.session.user;

    if (!obj.loggedIn) {
        res.redirect("/");
        return;
    }

    res.render("profile", obj);
});
app.post("/profile", async function(req, res) {
    var user = req.body;
    var ses = req.session.user;
    var update = { $set: { username: user.username, email: user.email, age: user.age, password: user.password.length > 1 ? bcrypt.hashSync(user.password) : ses.password } };
    await updateUserById(ses._id, update);
    res.redirect("/logout");
});

var server = app.listen(8080, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server running on " + host + ":" + port);
});

function getSessionObject(req) {
    var object = {};
    if (req.session == undefined || req.session.user == undefined) {
        object["admin"] = false;
        object["loggedIn"] = false;
        return object;
    }
    var user = req.session.user;
    object["admin"] = user.role == "admin";
    object["loggedIn"] = user != undefined;
    object["username"] = user.username;
    return object;
}
async function updateMongoQuestions(userSide) {
    var mongoSide = await getQuestionDataFromMongo();

    for (let i = 0; i < userSide.length; ++i) {
        mongoSide.questions[i].answers[userSide[i]].count++;
    }

    await client.connect();
    await client
        .db(dbName)
        .collection("questions")
        .update({}, mongoSide);
    client.close();
}
//local file only
function getQuestions() {
    var obj = require(__dirname + "/questions.json");
    return obj;
}
//just gets the 'questions.json' in mongo
async function getQuestionDataFromMongo() {
    await client.connect();
    var questionsData = await client
        .db(dbName)
        .collection("questions")
        .findOne();
    client.close();

    return questionsData;
}
async function insertUser(user) {
    await client.connect();
    await client
        .db(dbName)
        .collection("users")
        .insertOne(user);
    client.close();
}
async function getUserByUserName(name) {
    var user = {};
    await client.connect();
    await client
        .db(dbName)
        .collection("users")
        .findOne({ username: name })
        .then(
            data => {
                user = data;
            },
            error => {
                console.log("Request failed: getUserByUserName: " + error);
            }
        );
    client.close();
    return user;
}
async function getAllUsers() {
    await client.connect();
    var users = await client
        .db(dbName)
        .collection("users")
        .find()
        .toArray();
    client.close();
    return users;
}
async function updateUserById(id, update) {
    await client.connect();
    await client
        .db(dbName)
        .collection("users")
        .updateOne({ _id: new ObjectId(id) }, update);
    client.close();
}
