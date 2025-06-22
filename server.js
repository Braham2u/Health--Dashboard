const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");
const { generateFHIRVitals } = require("./simulateSensor");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

app.get("/api/summary", (req, res) => {
  const data = generateFHIRVitals();
  res.json({
    heartRateAvg: data.heartRate.valueQuantity.value,
    tempAvg: data.temperature.valueQuantity.value
  });
});

wss.on("connection", (ws) => {
  console.log("✅ Client connected via WebSocket");

  const interval = setInterval(() => {
    const data = generateFHIRVitals(); 
    console.log("Sending data to frontend:", data); 
    ws.send(JSON.stringify(data));
  },1000);//every second

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
