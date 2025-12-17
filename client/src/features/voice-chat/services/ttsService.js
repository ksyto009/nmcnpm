import { http } from "../../../lib/http";

let currentAudio = null;

export async function speak(text) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  const res = await http.post("/log/tts", { text }, { responseType: "blob" });

  const audioUrl = URL.createObjectURL(res.data);
  const audio = new Audio(audioUrl);
  currentAudio = audio;

  return new Promise((resolve) => {
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };

    audio.onerror = () => {
      currentAudio = null;
      resolve();
    };

    audio.play();
  });
}
