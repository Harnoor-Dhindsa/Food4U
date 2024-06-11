const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const cors = require("cors");

const stripe = Stripe(
  "sk_test_51POuNq2KqukMgC6pDFLPEjJjavI8pIO2MGIJzZkvNgB0nBqKrvvCfvdFM1iNNnLVXDHVI6ciZsjmFJ5dHBTUHmRF00Ko8Gdl5i"
); 

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
