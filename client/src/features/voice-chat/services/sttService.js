export function startSpeechRecognition(onInterim, onFinal, onEnd) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;

    if (result.isFinal) onFinal(transcript);
    else onInterim(transcript);
  };

  recognition.onerror = (e) => console.error("STT ERROR:", e);

  recognition.onend = onEnd;

  recognition.start();
  return recognition;
}
