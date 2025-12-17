import React, { useEffect, useRef, useState } from "react";
import { http } from "../lib/http";
import DictionaryModal from "./DictionaryModal";
import ReplyTools from "../features/voice-chat/components/ReplyTools";
import useAutoVoiceChat from "../features/voice-chat/hooks/useAutoVoiceChat";

export default function ChatUI({
  messages,
  setMessages,
  saveChat,
  activeChat,
  createNewChat,
}) {
  const [selectedWord, setSelectedWord] = useState("");
  const [showDict, setShowDict] = useState(false);
  const bottomRef = useRef(null);
  //----------------------------------------------------------------------
  const chatIdRef = useRef(null);

  // Luu lich su va title
  useEffect(() => {
    if (!activeChat || messages.length === 0) return;

    const firstUserMsg = messages.find((m) => m.item_role === "user");
    if (!firstUserMsg) return;

    const title =
      firstUserMsg.sentences.length > 25
        ? firstUserMsg.sentences.slice(0, 25) + "..."
        : firstUserMsg.sentences;

    saveChat(activeChat, title);
  }, [messages]);

  useEffect(() => {
    chatIdRef.current = activeChat;
  }, [activeChat]);

  //  Khi settings thay doi
  useEffect(() => {
    const reloadSettings = () => {
      setAutoSpeak(localStorage.getItem("autoSpeak") === "true");
      setAutoMode(localStorage.getItem("autoMode") === "true");
    };

    window.addEventListener("settings-updated", reloadSettings);
    return () => window.removeEventListener("settings-updated", reloadSettings);
  }, []);
  //--------------------------------------------------------------------
  /* --------------------------
      VOICE CHAT HOOK
  -------------------------- */
  const {
    input,
    setInput,
    isListening,
    isTalking,
    isSending,
    startListening,
    sendMessage,
    playTTS,
  } = useAutoVoiceChat(async (text) => {
    let chatId = chatIdRef.current || activeChat; // Use ref to get the latest chatId
    if (!chatId) chatId = await createNewChat();
    chatIdRef.current = chatId; // Update ref with new chatId

    setMessages((prev) => [...prev, { item_role: "user", sentences: text }]);

    const res = await http.post("/log", {
      history_id: chatId,
      sentences: text,
      item_role: "user",
    });

    const reply = res.data.data.ai.reply;
    const suggestions = res.data.data.ai.suggestions;

    setMessages((prev) => [
      ...prev,
      { item_role: "assistant", sentences: reply, suggestions },
    ]);

    playTTS(reply);
  });

  /* --------------------------
      TRANSLATE
  -------------------------- */
  const translateMessage = async (index) => {
    const text = messages[index].sentences;
    const res = await http.post("/log/translate", { text });

    setMessages((prev) => {
      const updated = [...prev];
      updated[index].translated = res.data.data.translatedText;
      return updated;
    });
  };

  /* --------------------------
      AUTO SCROLL
  -------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* --------------------------
      DICTIONARY
  -------------------------- */
  const openDictionary = (word) => {
    const clean = word.replace(/[^a-zA-Z]/g, "");
    if (!clean) return;
    setSelectedWord(clean);
    setShowDict(true);
  };

  /* --------------------------
      LAST SUGGESTIONS
  -------------------------- */
  const lastAssistant = messages.filter((m) => m.suggestions).slice(-1)[0];
  const suggestions = lastAssistant?.suggestions || [];

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message-row ${
              m.item_role === "user" ? "message-user" : "message-assistant"
            }`}
          >
            <div className="message-bubble">
              {m.sentences.split(" ").map((w, idx) => (
                <span
                  key={idx}
                  className="word"
                  onClick={() => openDictionary(w)}
                >
                  {w + " "}
                </span>
              ))}
            </div>

            <ReplyTools
              m={m}
              index={i}
              playTTS={playTTS}
              translateMessage={translateMessage}
            />
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions-bar">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-pill"
              onClick={() => setInput(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        <button
          className={`mic-btn ${isListening ? "listening" : ""}`}
          onClick={startListening}
          disabled={isTalking}
        >
          🎙️
        </button>

        <textarea
          className="chat-input"
          placeholder="Type or speak English..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          className="send-button"
          disabled={isSending}
          onClick={() => sendMessage()}
        >
          Send
        </button>
      </div>

      <DictionaryModal
        show={showDict}
        onHide={() => setShowDict(false)}
        word={selectedWord}
      />
    </div>
  );
}
