const express = require("express");
const stripe = require("stripe")(
  "sk_test_51POuNq2KqukMgC6pDFLPEjJjavI8pIO2MGIJzZkvNgB0nBqKrvvCfvdFM1iNNnLVXDHVI6ciZsjmFJ5dHBTUHmRF00Ko8Gdl5i"
);
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  if (amount <= 0) {
    return res.status(400).send({
      error: "Invalid amount",
    });
  }

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
