const express = require('express');
const stripe = require('stripe')('sk_test_51PRRQJAZdam9aIXzvvzURf3BkB4cyEVJDYzKka9TtFySiNgxeE2niZKjP7d4j8X0ssClRtYjuh7vhWOgF5DoF5hV00sjQ40qiK');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
