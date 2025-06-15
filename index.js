const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

const MOVIES_DB = new sqlite3.Database(path.join(__dirname, 'db/movies.db'));
const RATINGS_DB = new sqlite3.Database(path.join(__dirname, 'db/ratings.db'));

// Utility
const paginate = (page, size = 50) => {
  const limit = size;
  const offset = (page - 1) * size;
  return { limit, offset };
};

// Format dollars
const formatDollars = amount => `$${Number(amount).toLocaleString()}`;

// GET /
app.get('/', (req, res) => {
  res.send('Welcome to the Aetna Code Test!');
});

// GET /movies
app.get('/movies', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const { limit, offset } = paginate(page);

  const query = `
    SELECT imdbId, title, genres, releaseDate, budget
    FROM movies
    LIMIT ? OFFSET ?
  `;
  MOVIES_DB.all(query, [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(r => r.budget = formatDollars(r.budget));
    res.json(rows);
  });
});

// GET /movies/:id
app.get('/movies/:id', (req, res) => {
  const id = req.params.id;
  const movieQuery = `
    SELECT * FROM movies WHERE movieId = ?
  `;
  const ratingQuery = `
    SELECT AVG(rating) as avgRating FROM ratings WHERE movieId = ?
  `;

  MOVIES_DB.get(movieQuery, [id], (err, movie) => {
    if (err || !movie) return res.status(404).json({ error: 'Movie not found' });

    RATINGS_DB.get(ratingQuery, [id], (rerr, ratingData) => {
      if (rerr) return res.status(500).json({ error: rerr.message });

      res.json({
        imdbId: movie.imdbId,
        title: movie.title,
        description: movie.overview,
        releaseDate: movie.releaseDate,
        budget: formatDollars(movie.budget),
        runtime: movie.runtime,
        averageRating: ratingData.avgRating?.toFixed(2) || null,
        genres: movie.genres,
        originalLanguage: movie.language,
        productionCompanies: movie.productionCompanies
      });
    });
  });
});

// GET /movies/year/:year
app.get('/movies/year/:year', (req, res) => {
  const year = req.params.year;
  const page = parseInt(req.query.page) || 1;
  const { limit, offset } = paginate(page);
  const order = req.query.sort === 'desc' ? 'DESC' : 'ASC';

  const query = `
    SELECT imdbId, title, genres, releaseDate, budget
    FROM movies
    WHERE strftime('%Y', releaseDate) = ?
    ORDER BY releaseDate ${order}
    LIMIT ? OFFSET ?
  `;
  MOVIES_DB.all(query, [year, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(r => r.budget = formatDollars(r.budget));
    res.json(rows);
  });
});

// GET /movies/genre/:genre
app.get('/movies/genre/:genre', (req, res) => {
  const genre = req.params.genre.toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const { limit, offset } = paginate(page);

  const query = `
    SELECT imdbId, title, genres, releaseDate, budget
    FROM movies
    WHERE LOWER(genres) LIKE ?
    LIMIT ? OFFSET ?
  `;
  MOVIES_DB.all(query, [`%${genre}%`, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(r => r.budget = formatDollars(r.budget));
    res.json(rows);
  });
});

// app.listen() is start.js
module.exports = app;

// Catch 404
app.use((req, res) => {
  res.status(404).send('Route not found');
});