import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import Stripe from "stripe";

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());


app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Cuento personalizado",
            },
            unit_amount: 299,
          },
          quantity: 1,
        },
      ],
      success_url: "https://regal-pudding-2302e3.netlify.app/?payment=success",
      cancel_url: "https://regal-pudding-2302e3.netlify.app/?payment=cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Error creando sesión de pago" });
  }
});

app.post("/generate-story", async (req, res) => {
  const { prompt } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un autor profesional de cuentos infantiles con experiencia en psicología infantil y narrativa literaria."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8
    });

    const text = completion.choices[0].message.content;

    // ⬇️ IMPORTANTE: mantenemos EXACTAMENTE el mismo formato
    // que esperaba el frontend con Gemini
    res.json({
      candidates: [
        {
          content: {
            parts: [{ text }]
          }
        }
      ]
    });

  } catch (err) {
    console.error("❌ Error OpenAI:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Backend activo en puerto ${PORT}`);
});
