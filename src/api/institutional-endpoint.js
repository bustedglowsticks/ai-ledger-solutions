const express = require('express');
const app = express();
app.get('/metrics', (req, res) => {
  res.json({ yields: 0.8, passiveIncome: 2000 });
});
app.listen(3000, () => console.log('Institutional API running!'));
module.exports = app; 