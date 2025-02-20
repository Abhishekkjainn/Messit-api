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
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Documentation</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 800px;
              margin: auto;
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1, h2 {
              color: #333;
          }
          code {
              background: #f4f4f4;
              padding: 3px 6px;
              border-radius: 5px;
          }
          .endpoint {
              margin-bottom: 20px;
              padding: 15px;
              background: #e8f0fe;
              border-left: 5px solid #4285f4;
              border-radius: 5px;
          }
          .method {
              font-weight: bold;
              color: #fff;
              padding: 5px 10px;
              border-radius: 3px;
          }
          .get { background: #34a853; }
          .error { color: #d93025; }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>📄 API Documentation</h1>
          <p>Welcome to the API documentation. Below are the available endpoints and their responses.</p>
  
          <div class="endpoint">
              <span class="method get">GET</span>
              <h2>Root Endpoint</h2>
              <p><code>/</code> - Returns a simple greeting.</p>
              <h3>Response:</h3>
              <pre>{ "message": "Hello World!" }</pre>
          </div>
  
          <div class="endpoint">
              <span class="method get">GET</span>
              <h2>Mens Veg Menu</h2>
              <p><code>/messtype=MensVeg</code> - Fetches the vegetarian menu for men's mess.</p>
              <h3>Success Response (200):</h3>
              <pre>{ "day": { "breakfast": "Item", "lunch": "Item", ... } }</pre>
              <h3 class="error">Error Responses:</h3>
              <p><strong>404 Not Found:</strong> { "message": "No data found" }</p>
              <p><strong>500 Internal Server Error:</strong> { "error": "Internal Server Error" }</p>
          </div>
  
          <div class="endpoint">
              <span class="method get">GET</span>
              <h2>Mens Non-Veg Menu</h2>
              <p><code>/messtype=MensNonVeg</code> - Fetches the non-vegetarian menu for men's mess.</p>
              <h3>Success Response (200):</h3>
              <pre>{ "day": { "breakfast": "Item", "lunch": "Item", ... } }</pre>
              <h3 class="error">Error Responses:</h3>
              <p><strong>404 Not Found:</strong> { "message": "No data found" }</p>
              <p><strong>500 Internal Server Error:</strong> { "error": "Internal Server Error" }</p>
          </div>
  
          <div class="endpoint">
              <span class="method get">GET</span>
              <h2>Mens Special Menu</h2>
              <p><code>/messtype=MensSpecial</code> - Fetches the special menu for men's mess.</p>
              <h3>Success Response (200):</h3>
              <pre>{ "day": { "breakfast": "Item", "lunch": "Item", ... } }</pre>
              <h3 class="error">Error Responses:</h3>
              <p><strong>404 Not Found:</strong> { "message": "No data found" }</p>
              <p><strong>500 Internal Server Error:</strong> { "error": "Internal Server Error" }</p>
          </div>
  
          <p>For more details, contact the API administrator.</p>
      </div>
  </body>
  </html>
  `);
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
