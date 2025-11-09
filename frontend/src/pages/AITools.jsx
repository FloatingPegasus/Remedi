import { useState, useEffect, useRef } from "react";
import axios from "axios";

const AITools = () => {
  const [messages, setMessages] = useState(() => {
  const saved = localStorage.getItem("remedi_chat");
  return saved ? JSON.parse(saved) : [
    {
      role: "assistant",
      content:
        "Hi! I'm Remedi AI. Tell me your symptoms or concerns in simple words and I'll guide you with helpful general advice. I won't diagnose, but I can explain common possibilities and suggest the right doctor."
    }
  ];
  });


  const [input, setInput] = useState("");
  const isLoggedIn = !!localStorage.getItem("token");
  const chatContainerRef = useRef(null);
  const prevMessageCount = useRef(messages.length);

  useEffect(() => {
    localStorage.setItem("remedi_chat", JSON.stringify(messages));
    if (!chatContainerRef.current) return;

    const newCount = messages.length;
    const oldCount = prevMessageCount.current;

    if (newCount > oldCount) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    } else {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }

    prevMessageCount.current = newCount;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages(prev => [
      ...prev,
      { role: "user", content: userText },
      { role: "assistant", content: "" }
    ]);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`,
        { message: userText },
        {
          headers: {
            token: localStorage.getItem("token")  
          }
        }
      );

      let reply = res.data.reply || "Sorry, I couldn't respond.";
      reply = String(reply).replace(/\*\*/g, "");

      let i = 0;
      const speed = 18;

      const interval = setInterval(() => {
        const currentText = reply.slice(0, i + 1);

        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;

          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: currentText
            };
          }

          return updated;
        });

        i++;
        if (i >= reply.length) clearInterval(interval);
      }, speed);
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (updated[lastIndex]?.role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: "There was an error. Please try again."
          };
        }

        return updated;
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-4">🤖 AI Health Assistant</h1>
      <p className="text-gray-600 mb-6">
        This tool provides general guidance only. Not a substitute for professional medical advice.
      </p>

      <div
        ref={chatContainerRef}
        className="border rounded-xl p-4 bg-white h-[60vh] overflow-y-auto shadow-sm mb-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-100 text-right"
                  : "bg-gray-100 text-left"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          disabled={!isLoggedIn}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && isLoggedIn && sendMessage()}
          className="flex-1 border rounded-full px-4 py-3 outline-none"
          placeholder={
            isLoggedIn
              ? "Describe your symptoms or ask a question…"
              : "Login to start chatting with Remedi AI"
          }
        />
        <button
          onClick={() => isLoggedIn && sendMessage()}
          disabled={!isLoggedIn}
          className={`bg-primary text-white px-6 py-3 rounded-full ${
            !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Send
        </button>
        <button
          onClick={async () => {
            await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/ai/clear`,
              {},
              { headers: { token: localStorage.getItem("token") } }
            );

            localStorage.removeItem("remedi_chat");
            setMessages([
              {
                role: "assistant",
                content:
                  "Hi! I'm Remedi AI. Tell me your symptoms or concerns in simple words and I'll guide you with helpful general advice. I won't diagnose, but I can explain common possibilities and suggest the right doctor."
              }
            ]);
          }}
          className="text-sm text-gray-500 underline"
        >
          Restart Chat
        </button>

      </div>
    </div>
  );
};

export default AITools;
