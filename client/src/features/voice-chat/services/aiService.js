import { http } from "../../../lib/http";

export async function sendToAI(history_id, text) {
  const res = await http.post("/log", {
    history_id,
    sentences: text,
    item_role: "user",
  });

  return res.data.data.ai;
}
