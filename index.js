const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();

const token = process.env.TOKEN;
const myToken = process.env.MYTOKEN;

// Middleware
app.use(bodyParser.json());

// Define constants
const PORT = process.env.PORT || 3000;
const FACEBOOK_GRAPH_API_VERSION = "v13.0";

// Start the Express server
app.listen(PORT, () => {
  console.log("Webhook is listening on port " + PORT);
});

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];

  if (mode && verifyToken) {
    if (mode === "subscribe" && verifyToken === myToken) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Verification failed");
    }
  }
});

// Handling incoming messages
app.post("/webhook", (req, res) => {
  const bodyParams = req.body;

  console.log(JSON.stringify(bodyParams, null, 2));

  if (bodyParams.object === "page") {
    console.log("Inside bodyParam");
    const entry = bodyParams.entry[0];
    if (entry && entry.changes && entry.changes[0].value.messages) {
      const metadata = entry.changes[0].value.metadata;
      const messages = entry.changes[0].value.messages[0];

      const phoneNumberId = metadata.phone_number_id;
      const from = messages.from;
      const messageBody = messages.text.body;

      console.log("Phone number: " + phoneNumberId);
      console.log("From: " + from);
      console.log("Message body: " + messageBody);

      // Send a response message
      axios.post(
        `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${phoneNumberId}/messages?access_token=${token}`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: `Hi, I'm Prasath. Your message is: ${messageBody}`,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

// Default route
app.get("/", (req, res) => {
  res.status(200).send("Hello, this is the webhook setup");
});
