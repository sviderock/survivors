import { createSignal, For, onCleanup, onMount } from "solid-js";

const hrefToWs = (location: Location) =>
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/_ws/`;

export default function Home() {
  // State to hold the WebSocket instance and messages
  const [socket, setSocket] = createSignal<WebSocket | null>(null);
  const [messages, setMessages] = createSignal<string[]>([]);
  const [input, setInput] = createSignal("");

  onMount(() => {
    const ws = new WebSocket(hrefToWs(location));

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      console.log("Received message:", event.data);
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
  });

  // Send a message through the WebSocket
  const sendMessage = () => {
    if (socket()?.readyState === WebSocket.OPEN) {
      console.log(123);
      socket()!.send(input());
      setInput("");
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  return (
    <div class="p-4 font-sans">
      <h1 class="text-2xl font-bold mb-4">SolidJS WebSocket Client</h1>
      <div class="mb-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={input()}
          onInput={(e) => setInput(e.target.value)}
          class="p-2 w-72 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          class="ml-2 p-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
      <div>
        <h2 class="text-xl font-semibold mt-4 mb-2">Received Messages</h2>
        <ul class="list-disc pl-5">
          <For each={messages()}>{(item) => <li class="mb-1">{item}</li>}</For>
        </ul>
      </div>
    </div>
  );
}
