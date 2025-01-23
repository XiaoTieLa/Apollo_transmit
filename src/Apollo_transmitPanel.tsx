import { PanelExtensionContext } from "@foxglove/extension";
import { useLayoutEffect, useEffect, useState, useRef, ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { FoxgloveClient, ClientChannelWithoutId } from "@foxglove/ws-protocol";
import { topic1, topic2, topic3 } from "./config/topic_config";
import { command1, command2, command3 } from "./config/command_config";
import { address } from "./config/address_config";

function SimpleButtonPanel({ context }: { context: PanelExtensionContext }): ReactElement {
  // 频道配置定义（分拆为独立常量）
  const START_NODES_CHANNEL: ClientChannelWithoutId = {
    topic: topic1,
    encoding: "text", // 修改为文本编码
    schemaName: "StringCommand",
    schema: JSON.stringify({
      type: "string", // 简化为直接描述字符串类型
    }),
    schemaEncoding: "jsonschema",
  };

  const START_COLLECT_CHANNEL: ClientChannelWithoutId = {
    topic: topic2,
    encoding: "text",
    schemaName: "StringCommand",
    schema: JSON.stringify({
      type: "string",
    }),
    schemaEncoding: "jsonschema",
  };

  const KILL_NODES_CHANNEL: ClientChannelWithoutId = {
    topic: topic3,
    encoding: "text",
    schemaName: "StringCommand",
    schema: JSON.stringify({
      type: "string",
    }),
    schemaEncoding: "jsonschema",
  };

  const [status, setStatus] = useState("正在连接...");
  const [messages, setMessages] = useState<string[]>([]);
  const clientRef = useRef<FoxgloveClient | null>(null);
  const channelIds = useRef(new Map<string, number>());

  // Foxglove客户端连接管理
  useEffect(() => {
    const client = new FoxgloveClient({
      ws: new WebSocket(`${address}`, ["foxglove.websocket.v1"]),
    });
    clientRef.current = client;
    // 在组件内部添加订阅逻辑
    const subscribeToTopic = (topic: string) => {
      const client = clientRef.current;
      if (!client) {
        setMessages((prev) => [...prev, "[错误] 客户端未连接"]);
        return;
      }

      // 从已广告的频道中查找ID
      const channelId = channelIds.current.get(topic);
      if (!channelId) {
        setMessages((prev) => [...prev, `[错误] 频道未注册: ${topic}`]);
        return;
      }

      try {
        // 执行订阅
        const subscriptionId = client.subscribe(channelId);
        setMessages((prev) => [...prev, `[系统] 订阅成功: ${topic} (订阅ID: ${subscriptionId})`]);
        // setStatus(`已订阅频道: ${topic}`);
      } catch (error) {
        console.error("订阅失败:", error);
        setMessages((prev) => [...prev, `[错误] 订阅失败: ${topic}`]);
        // setStatus("订阅操作失败");
      }
    };

    const registerChannel = (channel: ClientChannelWithoutId, errorMessagePrefix: string) => {
      try {
        const client = clientRef.current;
        if (!client) {
          throw new Error("客户端未连接");
        }

        const channelId = client.advertise(channel);
        channelIds.current.set(channel.topic, channelId);
        setMessages((prev) => [
          ...prev,
          `[系统] 频道注册成功: ${channel.topic} (ID: ${channelId})`,
        ]);
        return channelId;
      } catch (error) {
        console.error(`${errorMessagePrefix}失败`, error);
        setMessages((prev) => [...prev, `[错误] ${errorMessagePrefix}失败: ${channel.topic}`]);
        throw error; // 可选：向上抛出错误供外部处理
      }
    };
    client.on("open", () => {
      console.log("Foxglove连接已建立");
      setStatus("已连接");
      registerChannel(START_NODES_CHANNEL, "启动节点频道");
      registerChannel(START_COLLECT_CHANNEL, "启动采集频道");
      registerChannel(KILL_NODES_CHANNEL, "关闭节点频道");
      subscribeToTopic(command1);
      subscribeToTopic(command2);
      subscribeToTopic(command3);
    });

    client.on("error", (error) => {
      console.error("Foxglove错误：", error);
      setStatus(`连接错误: ${error.message}`);
    });

    client.on("close", (event) => {
      console.log("Foxglove连接已关闭", event.reason);
      setStatus("连接已断开");
    });

    client.on("message", (msg) => {
      try {
        const textDecoder = new TextDecoder();
        const command = textDecoder.decode(msg.data);
        setMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] 收到 ${command}`]);
      } catch (error) {
        setStatus("收到了");
        console.error("消息处理失败:", error);
      }
    });

    return () => {
      // 组件卸载时关闭连接
      client.close();
    };
  }, []);

  // Foxglove面板生命周期
  useLayoutEffect(() => {
    context.onRender = (_, done) => done();
  }, [context]);

  // 通用的命令发送方法
  const sendControlCommand = (topic: string, command: string) => {
    const client = clientRef.current;
    const channelId = channelIds.current.get(topic);

    if (!client) {
      setMessages((prev) => [...prev, `[错误] 客户端未连接`]);
      return;
    }

    if (!channelId) {
      setMessages((prev) => [...prev, `[错误] 频道未注册: ${topic}`]);
      return;
    }

    try {
      const encoder = new TextEncoder();
      client.sendMessage(channelId, encoder.encode(command));

      setMessages((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 发送到 ${topic}: ${command}`,
      ]);
    } catch (error) {
      console.error("消息发送失败:", error);
      setMessages((prev) => [...prev, `[错误] 发送失败: ${topic} - ${(error as Error).message}`]);
    }
  };

  // 按钮点击处理
  const handleStart = () => {
    sendControlCommand("/control/start_nodes", "bash scripts/humanoid/start_nodes.sh");
    setStatus("启动节点");
  };

  const handleStop = () => {
    sendControlCommand("/control/start_collect", "bash scripts/humanoid/start_nodes.sh --co");
    setStatus("启动采集");
  };

  const handleReset = () => {
    sendControlCommand("/control/kill_nodes", "bash scripts/humanoid/kill_all_nodes.sh");
    setStatus("关闭节点");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* 主操作面板 */}
      <div
        style={{
          width: "90%",
          maxWidth: "800px",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          margin: "20px 0",
        }}
      >
        {/* 状态显示 */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "1.2rem",
            color: status.startsWith("已连接") ? "#2ecc71" : "#e74c3c",
            fontWeight: 500,
          }}
        >
          🟢 当前状态: {status}
        </div>

        {/* 按钮组 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={handleStart}
            // disabled={status !== "已连接"}
            style={
              {
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: "linear-gradient(135deg, #2ecc71, #27ae60)",
                color: "white",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                opacity: status === "已连接" ? 1 : 0.7,
                ...(status === "已连接" && {
                  ":hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(46, 204, 113, 0.3)",
                  },
                }),
              } as React.CSSProperties
            }
          >
            🚀 启动系统
          </button>

          <button
            onClick={handleStop}
            // disabled={status !== "已连接"}
            style={
              {
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: "linear-gradient(135deg, #e74c3c, #c0392b)",
                color: "white",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                opacity: status === "已连接" ? 1 : 0.7,
                ...(status === "已连接" && {
                  ":hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(231, 76, 60, 0.3)",
                  },
                }),
              } as React.CSSProperties
            }
          >
            ⚠️ 启动采集
          </button>

          <button
            onClick={handleReset}
            style={
              {
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: "linear-gradient(135deg, #3498db, #2980b9)",
                color: "white",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                ":hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(52, 152, 219, 0.3)",
                },
              } as React.CSSProperties
            }
          >
            🔄 重置系统
          </button>
        </div>

        {/* 消息记录 */}
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "1rem",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "#fcfcfc",
          }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              color: "#2c3e50",
              marginBottom: "1rem",
            }}
          >
            📨 消息记录
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                padding: "0.5rem",
                marginBottom: "0.5rem",
                borderRadius: "4px",
                backgroundColor: msg.includes("发送") ? "#e3f2fd" : "#f0f4c3",
                fontFamily: "'Fira Code', monospace",
                fontSize: "0.9rem",
                color: "#34495e",
              }}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function initApollo_transmit(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<SimpleButtonPanel context={context} />);
  return () => {
    root.unmount();
  };
}
