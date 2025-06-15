const app = require('./index');
const PORT = process.env.PORT || 3000;

app.listen(3000, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:3000`);
});