'use strict';
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');

app.get('/',  (request, response) =>{
    response.send('home');
});


client.connect()
.then( () => {
   app.listen(process.env.PORT, () => console.log(process.env.PORT)) 
});
 