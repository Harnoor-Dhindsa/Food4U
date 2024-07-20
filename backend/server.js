const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize Stripe with your secret key
const stripe = Stripe("sk_test_51POuNq2KqukMgC6pDFLPEjJjavI8pIO2MGIJzZkvNgB0nBqKrvvCfvdFM1iNNnLVXDHVI6ciZsjmFJ5dHBTUHmRF00Ko8Gdl5i");

// Endpoint to create a connected account
app.post("/create-connected-account", async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email: req.body.email,
    });
    res.send({ account });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Route to create an account link
app.post("/create-account-link", async (req, res) => {
  try {
    const { account_id } = req.body;
    const accountLink = await stripe.accountLinks.create({
      account: account_id,
      refresh_url: "http://your-redirect-url.com/reauth",
      return_url: "http://your-redirect-url.com/return",
      type: "account_onboarding",
    });
    res.send({ accountLink });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/payment-sheet", async (req, res) => {
  const { amount, currency, chefStripeAccountId } = req.body;

  try {
    // Create a Stripe customer
    const customer = await stripe.customers.create();

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ["card"],
      transfer_data: {
        destination: chefStripeAccountId,
      },
      customer: customer.id, // Set the customer ID here
    });

    // Create an EphemeralKey
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );

    // Log the generated data for debugging
    console.log({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });

    // Send response
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    res.status(500).send({ error: error.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://192.168.1.74:${PORT}`);
});
