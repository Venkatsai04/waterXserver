const express = require('express');
const webPush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs'); // For file system access (to store subscriptions)

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());


const keys = {
    "PublicKey": "BEAxVPVb72JDTuOy-jS7Qv9CIpkC-wilsr8gEd3-YMPnYWImyTMRP3iRNq5o3fhq4HDAnzI2FrRQH1hSdGjntPs",
    "PrivateKey": "TMxiFqjqhjT6R_6otAylSWs281SFAGpHlFTK15SloPM"
}

// Replace with your VAPID keys from https://console.cloud.google.com/
const publicKey = keys.PublicKey;
const privateKey =  keys.PrivateKey;
webPush.setVapidDetails('mailto:your-email@example.com', publicKey, privateKey);

const subscriptionsFile = 'subscriptions.json'; // File to store subscriptions

// Load subscriptions from file (if it exists)
let subscriptions = [];
try {
  const data = fs.readFileSync(subscriptionsFile);
  subscriptions = JSON.parse(data);
} catch (err) {
  console.error('Error loading subscriptions:', err);
}

// Save subscriptions to file
const saveSubscriptions = () => {
  fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions));
};

// Handle subscription requests
app.post('/subscribe', (req, res) => {
  const { subscription } = req.body;
  console.log('Received subscription:', subscription);
  subscriptions.push(subscription);
  saveSubscriptions();
  res.status(201).json({});
});

// Send push notifications
app.post('/sendNotification', (req, res) => {
  const { notification } = req.body;

  if (!notification) {
    return res.status(400).json({ error: 'Notification data is required' });
  }

  subscriptions.forEach((subscription) => {
    if (subscription && subscription.endpoint) {
      webPush.sendNotification(subscription, JSON.stringify(notification))
        .then(console.log("sent"))
        .catch((err) => console.error(err));
    } else {
      console.error('Invalid subscription:', subscription);
    }
  });

  res.status(201).json({});
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
