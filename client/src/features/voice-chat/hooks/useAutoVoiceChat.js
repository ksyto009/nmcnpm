import { useEffect, useRef, useState } from "react";
import { sendToAI } from "../services/aiService";
import { speak } from "../services/ttsService";
import { startSpeechRecognition } from "../services/sttService";

export default function useAutoVoiceChat(onSendComplete) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const recognitionRef = useRef(null);

  const autoSpeak = localStorage.getItem("autoSpeak") === "true";
  const autoMode = localStorage.getItem("autoMode") === "true";

  /* -----------------------------------------
        🎤 START SPEECH-TO-TEXT
  ----------------------------------------- */
  const startListening = () => {
    if (isTalking) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    recognitionRef.current = startSpeechRecognition(
      (text) => setInput(text),
      async (finalText) => {
        setInput(finalText);
        if (autoMode) sendMessage(finalText);
      },
      () => setIsListening(false)
    );

    setIsListening(true);
  };

  /* -----------------------------------------
        📤 SEND MESSAGE
  ----------------------------------------- */
  const sendMessage = async (msg) => {
    const text = (msg ?? input).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInput("");

    await onSendComplete(text);

    setIsSending(false);
  };

  /* -----------------------------------------
        🔊 TEXT-TO-SPEECH
  ----------------------------------------- */
  const playTTS = async (text, force = false) => {
    if (!autoSpeak && !force) return;

    setIsTalking(true);
    // recognitionRef.current?.stop();
    setIsListening(false);

    await speak(text);

    setIsTalking(false);
    // 👇 TỰ ĐỘNG NGHE LẠI
    if (autoMode) {
      startListening();
    }
  };

  /* -----------------------------------------
        Cleanup
  ----------------------------------------- */
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    input,
    setInput,
    isListening,
    isTalking,
    isSending,
    startListening,
    sendMessage,
    playTTS,
  };
}
