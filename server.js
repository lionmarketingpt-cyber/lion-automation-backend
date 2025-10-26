require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const leadsRoutes = require("./routes/leads");
const brandRoutes = require("./routes/brand");
const chatRoutes = require("./routes/chat");
const statsRoutes = require("./routes/stats");

const app = express();

app.use(express.json());
const allowedOrigins = [
  "https://verdant-buttercream-2294a5.netlify.app",
  "https://lion-automation-backend.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // permite também chamadas sem origem (ex.: Postman ou testes locais)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin), false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ⚙️ Resposta manual ao pré-voo (preflight) que o browser faz
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(204).end();
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/stats", statsRoutes);

// teste rápido da API
app.get("/", (req, res) => {
  res.json({ ok: true, service: "Lion Automation API" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Lion Automation API a correr na porta " + PORT);
});


