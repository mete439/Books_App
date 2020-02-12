'use strict';
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


app.get('/',  (request, response) =>{
    response.send('home');
});
app.get('/', (request, response) => {
   response.render('/pages/index.ejs');
});

app.get('/searches/new', (request, response) => {
   response.render('pages/searches/new.ejs');
});


client.connect()
.then( () => {
   app.listen(process.env.PORT, () => console.log(process.env.PORT)) 
});
 