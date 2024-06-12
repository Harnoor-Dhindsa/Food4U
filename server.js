const express = require("express");
const bodyParser = require("body-parser");
const { Stripe } = require("stripe");

const app = express();
const port = 3000; // Choose your desired port number
const stripe = new Stripe(
  "sk_test_51POuNq2KqukMgC6pDFLPEjJjavI8pIO2MGIJzZkvNgB0nBqKrvvCfvdFM1iNNnLVXDHVI6ciZsjmFJ5dHBTUHmRF00Ko8Gdl5i"
);

app.use(bodyParser.json());

// Endpoint to handle the POST request from the client
app.post("/checkout", async (req, res) => {
  const { menu, selectedPlan } = req.body;

  try {
    // Ensure menu price is defined
    if (!menu.price) {
      throw new Error("Menu price is not defined.");
    }

    // Use Stripe SDK to create a payment intent or perform any other necessary action
    const paymentIntent = await stripe.paymentIntents.create({
      amount: menu.price,
      currency: "usd",
      description: `Payment for ${selectedPlan} plan`,
    });

    // Process the received data here (e.g., save it to a database)

    // Send a response back to the client
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
