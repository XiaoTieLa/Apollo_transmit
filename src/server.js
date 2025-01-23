const { FoxgloveServer } = require("@foxglove/ws-protocol");
const { WebSocketServer } = require("ws");

async function main() {
  const server = new FoxgloveServer({ name: "example-server" });
  
  // 创建WebSocket服务器
  const ws = new WebSocketServer({
    host: "127.0.0.1",
    port: 8765,
    handleProtocols: (protocols) => server.handleProtocols(protocols),
  });

  // 添加两个频道
  const chInput = server.addChannel({
    topic: "/input",
    encoding: "json",
    schemaName: "InputMessage",
    schema: JSON.stringify({
      type: "object",
      properties: {
        content: { type: "string" },
        timestamp: { type: "number" }
      }
    })
  });

  const chAck = server.addChannel({
    topic: "/ack",
    encoding: "json",
    schemaName: "AckMessage",
    schema: JSON.stringify({
      type: "object",
      properties: {
        status: { type: "string" },
        received_at: { type: "number" },
        original_content: { type: "string" }
      }
    })
  });

  // 消息处理逻辑
  server.on("message", ({ channelId, data }) => {
    if (channelId === chInput) {
      try {
        const message = JSON.parse(data.toString());
        const ackPayload = {
          status: "RECEIVED",
          received_at: Date.now(),
          original_content: message.content
        };

        // 发送确认消息
        server.sendMessage(
          chAck,
          BigInt(Date.now()) * 1_000_000n,
          Buffer.from(JSON.stringify(ackPayload))
        );

        console.log(`Received: ${message.content}`);
        
      } catch (error) {
        console.error("Message processing error:", error);
        const errorAck = {
          status: "ERROR",
          received_at: Date.now(),
          error: "INVALID_FORMAT"
        };
        server.sendMessage(
          chAck,
          BigInt(Date.now()) * 1_000_000n,
          Buffer.from(JSON.stringify(errorAck))
        );
      }
    }
  });

  // 服务器事件处理
  ws.on("listening", () => {
    console.log("Server listening on port 8765");
  });

  ws.on("connection", (conn, req) => {
    const clientInfo = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
    console.log(`New connection from ${clientInfo}`);
    server.handleConnection(conn, clientInfo);
  });

  server.on("error", (err) => {
    console.error("Server error:", err);
  });
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});