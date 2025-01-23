const { FoxgloveClient } = require("@foxglove/ws-protocol");
const { WebSocket } = require("ws");

async function main() {
  const client = new FoxgloveClient({
    ws: new WebSocket(`ws://localhost:8765`, [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
  });
  const deserializers = new Map();
  client.on("advertise", (channels) => {
    for (const channel of channels) {
      if (channel.encoding !== "json") {
        console.warn(`Unsupported encoding ${channel.encoding}`);
        continue;
      }
      const subId = client.subscribe(channel.id);
      const textDecoder = new TextDecoder();
      deserializers.set(subId, (data) => JSON.parse(textDecoder.decode(data)));
    }
  });
  client.on("message", ({ subscriptionId, timestamp, data }) => {
    console.log({
      subscriptionId,
      timestamp,
      data: deserializers.get(subscriptionId)(data),
    });
  });
}

main().catch(console.error);