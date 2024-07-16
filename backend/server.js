const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize Stripe with your secret key
const stripe = Stripe(
  "sk_test_51POuNq2KqukMgC6pDFLPEjJjavI8pIO2MGIJzZkvNgB0nBqKrvvCfvdFM1iNNnLVXDHVI6ciZsjmFJ5dHBTUHmRF00Ko8Gdl5i"
);

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

// Route to handle payment intent creation
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency, chefStripeAccountId } = req.body;

    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-04-10" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      application_fee_amount: Math.floor(amount * 0.1), // Example fee, adjust as needed
      transfer_data: { destination: chefStripeAccountId },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey:
        "pk_test_51POuNq2KqukMgC6pFkXCoiuutre7lxD0SiP00uRdvNFecGzQMuAX9bJsFlC3Jklgr94eOkWnp2m6GH27l3ijdSoL00DIkImryA",
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
