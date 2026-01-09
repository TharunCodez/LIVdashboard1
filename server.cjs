const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8080;

// ---- In-memory live state ----
let currentData = {
  deviceID: "AVF001LIV01",
  temperature: 0,
  humidity: 0,
  soilMoisture: 0,
  rain: false,
  reservoir: 0,
  valve: false,
  pump: false
};

// ---- HTTP server (for hardware POST) ----
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/update") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body);

        if (!payload.deviceID) {
          res.writeHead(400);
          return res.end("deviceID missing");
        }

        currentData = { ...currentData, ...payload };
        broadcast(currentData);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
      } catch (err) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  } else {
    res.writeHead(200);
    res.end("Backend running");
  }
});

// ---- WebSocket ----
const wss = new WebSocketServer({ server });

wss.on("connection", ws => {
  console.log("WebSocket client connected");
  ws.send(JSON.stringify(currentData));
});

// ---- Broadcast helper ----
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

// ---- Start server ----
server.listen(PORT, () => {
  console.log(`HTTP  : https://livdashboard1.onrender.com`);
  console.log(`WS    : wss://livdashboard1.onrender.com`);
});
