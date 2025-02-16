const express = require('express');

const app = express();
const PORT = 4030;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Moderation API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
