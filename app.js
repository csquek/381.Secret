//jshint esversion:6
/* 381. Using Environment Variables to Keep Secrets Safe
1. require('dotenv').config()
2. create .env hidden file and save our secret key in .env
3. Test our.env file: console.log(process.env.API_KEY);
*/
require("dotenv").config(); //1. require dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); //1. require mongoose-encryption

const app = express();

console.log(process.env.SECRET);//3.Test for .env file keys

app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect = mongoose.connect("mongodb://localhost:27017/userDB",
{useNewUrlParser: true});

const userSchema = new mongoose.Schema({ //1.create mongoose new schema
    email: String,
    password: String
});


//const secret = "Thisisourlittlesecret."; // 2 cut & paste - store in - see .env hidden file

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] }); 

const User = new mongoose.model("User", userSchema); 


app.get("/", function (req, res) { // http://localhost:3000 start at home.ejs
    res.render("home");//At home.ejs to register or login. select register
});

app.get("/register", function (req, res) { 
    res.render("register");
});

app.post("/register", function (req, res) {//post request from home.ejs <form>
    const newUser = new User({ //key in email & password
        email: req.body.username,
        password: req.body.password
    });
    newUser.save(function (err) { //encrypt password when you call save()
        if (err) {
            console.log(err);    
        } else {
            res.render("secrets");//Yes go to secret.ejs to display
        }
    });

});

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) { //After register,home.ejs -->app.post(login).
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ //3b decrypt password when you call find()
            email: username
        }, // email(DB)=username(login)?
        function (err, foundUser) {
            if (err) {
                console.log(err)
            } else {
                if (foundUser) {
                    if (foundUser.password === password) //password(DB)=password(login)?
                        res.render("secrets") // email & password authenticated OK
                }
            }
        }
    )
});


app.listen(3000, function () {
console.log("Server started on port 3000");
});