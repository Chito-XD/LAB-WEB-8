// Dependencies
// =============================================================
var express = require("express");
var path = require("path");
var nodemailer = require('nodemailer');

// Sets up the Express App
// =============================================================
var app = express();
var PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Variables
// =============================================================
const TABLES = 5;
let reservations = [];
let waitlist = [];
const counter = {
    home: 0,
    tables: 0,
    reservas: 0
};
const emailConfig = {
    email: 'correo',
    pass: 'contrasena'
}
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailConfig.email,
      pass: emailConfig.pass
    }
});



// Routes
// =============================================================

// Basic route that sends the user first to the AJAX Page
app.get("/", function(req, res) {
    counter.home++;
    res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/tables", function(req, res) {
    counter.tables++;
    res.sendFile(path.join(__dirname, "tables.html"));
});

app.get("/reserve", function(req, res) {
    counter.reservas++;
    res.sendFile(path.join(__dirname, "reserve.html"));
});

app.get("/api/tables", function(req, res) {
    res.json(reservations);
});

app.get("/api/waitlist", function(req, res) {
    res.json(waitlist);
});

// API routes
app.post("/api/reserve", function(req, res) {
    const { name, phone, email, id } = req.body;
    const reservation = { id, name, email, phone };
    if (reservations.length < TABLES){
        reservations.push(reservation);
        return res.send(true);
    } 
    waitlist.push(reservation);
    return res.send(false);
});

app.get('/api/getCounters', function(req, res){
    res.json([counter]);
});


app.post("/api/clear", function(req, res) {
    reservations = [];
    waitlist = [];
    res.send(true);
});

app.post('/api/checkOff', function(req, res){
    reservations = [];
    if (waitlist.length>0){
        reservations.push(waitlist.shift());
    }
    res.send(true);
});

app.post('/api/sendmail', function(req, res){
    const availablePlaces = TABLES - reservations.length;
    for(let i=0; i<availablePlaces; i++){
        const mailOptions = {
            from: emailConfig.email,
            to: waitlist[i],
            subject: 'Disponibilidad para usted',
            text: 'Se acaba de abrir un espacio para que usted pueda ir a comer.'
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        });
    }
    res.send(true);
})


app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});