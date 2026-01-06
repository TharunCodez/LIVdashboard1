
const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket Server is running');
});

const wss = new WebSocketServer({ server });

// Mock state
let currentData = {
  deviceID: "AVF001LIV01",
  temperature: 31.8,
  humidity: 52.8,
  soilMoisture: 9,
  rain: false,
  reservoir: 82,
  valve: false,
  pump: false
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial data to the new client
  ws.send(JSON.stringify(currentData));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      // If we receive data from a device, update state and broadcast
      if (parsed.deviceID) {
        currentData = { ...currentData, ...parsed };
        broadcast(currentData);
      }
    } catch (e) {
      console.error('Invalid message format', e);
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
}



server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`WebSocket server active on ws://localhost:${PORT}`);
});
