// webhook.js (Fastzix auto-verifier)
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
app.use(bodyParser.json());

// 🛡️ Your serviceAccountKey.json file path (Firebase admin SDK)
const serviceAccount = require("/etc/secrets/firebase-key.json");

// 🔐 Fastzix API Key (SECRET — never reveal this)
const FASTZIX_KEY = "1V7agSKxdxLyS9DMOqnx7TY475vehAz3";

// 🔥 Firebase init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://onepick-app-50473-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = admin.database();

// ✅ Create payment order
app.post("/create", async (req, res) => {
  const { amount, remark } = req.body;

  try {
    const r = await fetch("https://fastzix.com/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": FASTZIX_KEY
      },
      body: JSON.stringify({
        amount,
        redirect_url: "https://google.com",
        webhook_url: "https://your-replit-username.repl.co/webhook",
        remark
      })
    });

    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.json({ status: "fail", message: e.message });
  }
});

// ✅ Webhook endpoint to auto-verify payment
app.post("/webhook", (req, res) => {
  const { status, remark, amount } = req.body;
  if (status === "success" && remark && amount) {
    const key = `${remark}_${amount}`;
    db.ref("payments/" + key).set(true);
  }
  res.sendStatus(200);
});

// ✅ Run server
app.listen(3000, () => {
  console.log("Webhook server running on port 3000");
});
