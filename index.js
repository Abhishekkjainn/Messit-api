require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./firebase');

const app = express();
const port = 3000;

app.use(cors());

// Valid mess types to prevent incorrect requests
const validMessTypes = [
  'MensVeg',
  'MensNonVeg',
  'MensSpecial',
  'WomensVeg',
  'WomensNonVeg',
  'WomensSpecial',
];

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Dynamic endpoint for fetching menu based on mess type
app.get('/messtype=:messType', async (req, res) => {
  try {
    const { messType } = req.params;

    // Validate mess type
    if (!validMessTypes.includes(messType)) {
      return res.status(400).json({
        status: 400,
        message: `Invalid mess type. Valid options: ${validMessTypes.join(
          ', '
        )}`,
      });
    }

    const messRef = db.collection(messType);
    const snapshot = await messRef.get();

    if (snapshot.empty) {
      return res.status(404).json({
        status: 404,
        message: `No menu found for ${messType}`,
      });
    }

    let menuData = {};
    snapshot.forEach((doc) => {
      menuData[doc.id] = doc.data();
    });

    res.status(200).json({
      status: 200,
      message: `Menu for ${messType} fetched successfully`,
      data: menuData,
    });
  } catch (error) {
    console.error(`Error fetching menu for ${req.params.messType}:`, error);
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
