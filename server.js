'use strict';

// REQUIRE
const superagent = require('superagent');
const express = require('express');
require('dotenv').config();
const app = express();
const pg = require('pg');
const methodOverride = require('method-override');
const client = new pg.Client(process.env.DATABASE_URL);

// GLOBAL API URL
let url = 'https://www.googleapis.com/books/v1/volumes?q=';

// EJS
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

// ROUTES

// home
app.get('/', getBooks);

// search page
app.get('/searches/new', (request, response) => {response.render('pages/searches/new.ejs');});

// search results
app.post('/searches', createBookArray);


// detail page
app.get('/books/details/:id', (request, response) => {
  let id = request.params.id;

  let SQL = 'SELECT * FROM libraries WHERE id = $1;';
  let values = [id];

  client.query(SQL, values)
    .then( result => {
      response.render('pages/books/details.ejs', { book: result.rows[0] })
    })
    .catch(() => { console.log('error')});
})

// save new book to database
app.post('/books', (request, response) => {
  let { author, title, isbn, image_url, description} = request.body;
  let SQL = `INSERT INTO libraries(author, title, isbn, image_url, description, bookshelf) 
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
  `;

  let values = [author, title, isbn, image_url, description, ''];

  client.query(SQL, values)
    .then(results => {response.redirect('/')})
    .catch(() => { console.log('error')});
});

// update route
app.put('/books/details/:id', (request, response) =>{
  let id = request.params.id;
  let author = request.body.author;
  let title = request.body.title;
  let isbn = request.body.isbn;
  let image_url = request.body.image_url;
  let description = request.body.description;
  let bookshelf = request.body.bookshelf;
  
  let SQL = 'UPDATE libraries SET author=$1, title=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7;';
  let values = [author, title, isbn, image_url, description, bookshelf, id];
  
  client.query(SQL, values)
    .then(() =>{
      response.redirect(`/books/details/${id}`);
    })
    .catch(() => { console.log('reeor')});
})

// delete route
// app.delete('/books/details/:id', (request, response) => {
//   let id = request.params.id;

//   let SQL = 'DELETE FROM libraries WHERE id=$1'
//   let values = [id];

//   client.query(SQL, values)
//     .then(() => {response.redirect('/')})
//     .catch(() => { console.log('error') })
// })



// HELPER FUNCTIONS
function getBooks(request, response){
  let SQL = 'SELECT * FROM libraries;';
 return client.query(SQL)
  .then(results => {
    response.render('pages/index.ejs', {booklist: results.rows, bookCounts: results.rowCount})})

  .catch(() => { console.log('error')});
}

// function getURL(request, response) {
//   let searchQuery = request.body.search; // search bar
//   let title = request.body.title; // title radio
//   let author = request.body.author; // author radio

  
//   if (title) {
//     return url += `+intitle:${searchQuery}`;
//   } else if (author) {
//     return url += `+inauthor:${searchQuery}`;
//   } else {
//     response.render('pages/error.ejs');
//   }
// };

function createBookArray(request, response) {
  getURL(request, response);

  try {
    superagent.get(url)
      .then(data =>{
        let bookArray = data.body.items.map( items => {
          let resultData = items.volumeInfo;
          let book = new Book(resultData);
          return book;
        });
        // console.log(bookArray);
        response.render('pages/searches/show.ejs', { books: bookArray });
      });
  }
  catch {
    response.render('pages/error.ejs');
  }
}


// CONSTRUCTOR
function Book(bookData) {
  this.author = bookData.authors || 'no author available';
  this.title = bookData.title || 'no title available';
  this.isbn = bookData.industryIdentifiers ? bookData.industryIdentifiers[0].identifier : 'no ISBN available';
  this.cover = bookData.imageLinks.thumbnail || 'no image available';
  this.description = bookData.description || 'no description available';
}

// LISTENER
client.connect()
  .then(() =>{
    app.listen(process.env.PORT, () => console.log(`server up on ${process.env.PORT}`));
  })
  .catch(() => { console.log('error')});
