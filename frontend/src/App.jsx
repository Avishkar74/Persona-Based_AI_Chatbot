import { useMemo, useRef, useState, useEffect } from "react";

import Chat from "./components/Chat.jsx";
import InputBox from "./components/InputBox.jsx";
import PersonaSwitcher from "./components/PersonaSwitcher.jsx";
import { personas } from "./data/personas.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const buildHistory = (messages) =>
  messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({ role: message.role, content: message.content }));

const buildDefaultGreeting = (personaName) => ({
  role: "assistant",
  content: `Hi, I am ${personaName}. How can I help you today?`,
});

export default function App() {
  const [activePersona, setActivePersona] = useState(personas[0]);
  const [messages, setMessages] = useState([
    buildDefaultGreeting(personas[0].name),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const personaChips = useMemo(() => activePersona.suggestions, [activePersona]);

  const handlePersonaChange = (personaId) => {
    const persona = personas.find((item) => item.id === personaId);
    if (!persona) {
      return;
    }

    setActivePersona(persona);
    setMessages([buildDefaultGreeting(persona.name)]);
  };

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) {
      return;
    }

    const trimmed = text.trim();

    // Create the new messages array including the user message so history is accurate
    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          persona: activePersona.id,
          history: buildHistory(newMessages),
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      if (data && typeof data.reply === "object") {
        const { text, metadata } = data.reply;
        const assistantText = text || "";

        // Remove any visible METADATA placeholder messages previously added
        setMessages((prev) => {
          const filtered = prev.filter(
            (m) => !(m.role === "assistant" && typeof m.content === "string" && m.content.startsWith("METADATA:"))
          );
          // Store metadata on the message object but do NOT display it in the chat UI
          return [...filtered, { role: "assistant", content: assistantText, metadata }];
        });
      } else {
        const replyContent = data.reply || "No reply";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: replyContent },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="brand">
          Persona<span>Chat</span>
        </h1>
        <PersonaSwitcher
          personas={personas}
          activeId={activePersona.id}
          onChange={handlePersonaChange}
        />
      </aside>

      <main className="chat-panel">
        <header className="chat-header">
          <div>
            <h2>{activePersona.name}</h2>
            <p className="persona-subtitle">{activePersona.subtitle}</p>
          </div>
          <span className="active-pill">Active Persona</span>
        </header>

        <div className="chat-body" ref={scrollRef}>
          <Chat messages={messages} isLoading={isLoading} />
        </div>

        <div className="chip-row">
          {personaChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="chip"
              onClick={() => handleSend(chip)}
              disabled={isLoading}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="chat-input">
          <InputBox onSend={handleSend} disabled={isLoading} />
        </div>
      </main>
    </div>
  );
}
