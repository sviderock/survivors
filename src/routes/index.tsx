import { createSignal, For, onCleanup, onMount } from "solid-js";
import { parseJson } from "~/utils";

const hrefToWs = (location: Location) =>
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/_ws/`;

export default function Home() {
  // State to hold the WebSocket instance and messages
  const [socket, setSocket] = createSignal<WebSocket | null>(null);
  const [messages, setMessages] = createSignal<string[]>([]);
  const [ping, setPing] = createSignal(0);
  const pingInterval = setInterval(() => {
    socket()?.send(JSON.stringify({ type: "ping", ts: Date.now() }));
  }, 1000);

  const pingState = () => {
    if (ping() <= 10) {
      return { color: "#00E676", type: "Professional" };
    } else if (ping() < 20) {
      return { color: "#76FF03", type: "Pretty decent" };
    } else if (ping() < 50) {
      return { color: "#FFEB3B", type: "Perfectly average" };
    } else if (ping() < 100) {
      return { color: "#FF9800", type: "Poor" };
    }
    return { color: "#F44336", type: "Unplayable" };
  };

  onMount(() => {
    const ws = new WebSocket(hrefToWs(location));

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      console.log("Received message:");
      const message = parseJson(event.data);
      if (message.type === "pong") {
        setPing(Date.now() - message.ts);
      }
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed", event);
    };

    ws.onerror = (error) => {
      console.error("WebSocket encountered an error:", error);
    };

    setSocket(ws);
  });

  // Clean up when the component unmounts
  onCleanup(() => {
    socket()?.close();
    clearInterval(pingInterval);
  });

  return (
    <div class="p-4 font-sans">
      <h1 style={{ display: "flex", "justify-content": "center" }} class="text-2xl font-bold mb-4">
        SolidJS WebSocket Client
      </h1>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "10px",
          "align-items": "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            "align-items": "center",
            "justify-content": "center",
            "font-size": "32px",
          }}
        >
          <span>Ping is {ping()}ms</span>
          <span
            style={{
              width: "15px",
              height: "15px",
              "border-radius": "100%",
              "background-color": pingState().color,
            }}
          />
        </div>

        <span style={{ "font-size": "24px", color: pingState().color }}>({pingState().type})</span>
      </div>
    </div>
  );
}
