// WhatsApp Webhook Server
// Handles webhook verification and incoming messages

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = 'nursingcare_whatsapp';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Middleware
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// GET - Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified!');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed');
    res.sendStatus(403);
  }
});

// POST - Receive messages
app.post('/webhook', async (req, res) => {
  console.log('Incoming webhook:', JSON.stringify(req.body, null, 2));

  try {
    const body = req.body;

    // Process messages
    if (body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        if (entry.changes && entry.changes.length > 0) {
          const value = entry.changes[0].value;

          if (value.messages) {
            for (const message of value.messages) {
              await handleIncomingMessage(message);
            }
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error.message);
    res.status(500).send('Error');
  }
});

// Handle incoming message
async function handleIncomingMessage(message) {
  const from = message.from;
  const type = message.type;
  const text = message.text?.body;

  console.log('New message:', { from, type, text });

  // Respond based on message content
  if (type === 'text' && text) {
    const response = processMessage(text);
    await sendWhatsAppMessage(from, response);
  }
}

// Process message and generate response
function processMessage(text) {
  const cmd = text.trim().toUpperCase();

  switch (cmd) {
    case 'HI':
    case 'HELLO':
      return 'Welcome to NursingCare.pk! 👋\n\nSend:\n- IN : Check in\n- OUT : Check out\n- LEAVE : Request leave\n- SHIFT : View shift info';

    case 'IN':
      return '✅ Check-in recorded!\n\nHave a great shift!';

    case 'OUT':
      return '✅ Check-out recorded!\n\nThank you for your work today!';

    case 'LEAVE':
      return '📝 Leave Request\n\nPlease send in format:\nLEAVE [type] [dates] [reason]\n\nExample: LEAVE sick 15-03-2026 fever';

    case 'SHIFT':
      return '📅 Shift Info\n\nDay: 08:00 - 20:00\nNight: 20:00 - 08:00\n\nContact admin for your schedule.';

    default:
      return '❓ Unknown command.\n\nSend:\n- HI : Help\n- IN : Check in\n- OUT : Check out\n- LEAVE : Request leave\n- SHIFT : Shift info';
  }
}

// Send WhatsApp message
async function sendWhatsAppMessage(to, message) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.log('WhatsApp credentials not configured. Would send:', { to, message });
    return;
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
}

// Health check
app.get('/', (req, res) => {
  res.send('WhatsApp Webhook Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook URL: /webhook`);
  console.log(`Verify Token: ${VERIFY_TOKEN}`);
});
