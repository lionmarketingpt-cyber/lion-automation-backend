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
app.use(cors({
  origin: "*", // depois podes trocar para o teu domínio Netlify
}));

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
