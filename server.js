require('dotenv').config();  // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');  // Import Twilio SDK
const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Load Twilio credentials from environment variables
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// Create a Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Helper function to validate phone number (Indian format)
function isValidPhoneNumber(phoneNumber) {
  // Basic validation: Phone number should be digits only and have 10 digits
  return /^[0-9]{10}$/.test(phoneNumber);
}

// API route to send a flirty message
app.post('/send-message', (req, res) => {
  const { phoneNumber, message } = req.body;

  // Validate the request body
  if (!phoneNumber || !message) {
    return res.status(400).send('Missing required fields: phoneNumber or message');
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return res.status(400).send('Invalid phone number format. It should be 10 digits.');
  }

  // Format the phone number for Twilio (add the country code)
  const formattedPhoneNumber = `+91${phoneNumber}`;  // Indian country code +91

  // Send SMS using Twilio API
  client.messages
    .create({
      body: message,
      from: TWILIO_PHONE_NUMBER,  // Twilio phone number
      to: formattedPhoneNumber,
    })
    .then((message) => {
      console.log('Message sent:', message.sid);
      res.status(200).send('Message sent: ' + message.sid);
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      res.status(500).send('Failed to send message: ' + error.message);
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
