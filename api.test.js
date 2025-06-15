const request = require('supertest');
const express = require('express');
const app = require('./index');

describe('Movies API', () => {

  // 1. List all movies
  it('GET /movies?page=1 should return 200 and a list of movies', async () => {
    const res = await request(app).get('/movies?page=1');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('imdbId');
  });

  // 2. Get movie details by ID
  it('GET /movies/:id should return movie details', async () => {
    const movieId = 123; // use an ID that exists in your DB
    const res = await request(app).get(`/movies/${movieId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('averageRating');
  });

  // 3. Movies by year
  it('GET /movies/year/:year should return filtered movies', async () => {
    const res = await request(app).get('/movies/year/2010?page=1&sort=asc');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('releaseDate');
  });

  // 4. Movies by genre
  it('GET /movies/genre/:genre should return movies of that genre', async () => {
    const res = await request(app).get('/movies/genre/action?page=1');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].genres.toLowerCase()).toContain('action');
  });
});