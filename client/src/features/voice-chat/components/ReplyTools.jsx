import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

export default function ReplyTools({ m, index, playTTS, translateMessage }) {
  if (m.item_role === "user") return null;

  return (
    <div className="reply-tools">
      <button className="tool-btn" onClick={() => playTTS(m.sentences, true)}>
        🔊
      </button>

      <OverlayTrigger
        trigger="click"
        placement="bottom"
        rootClose
        overlay={
          <Popover>
            <Popover.Header>Vietnamese</Popover.Header>
            <Popover.Body>
              {m.translated ? m.translated : "Translating..."}
            </Popover.Body>
          </Popover>
        }
        onToggle={(show) => {
          if (show && !m.translated) translateMessage(index);
        }}
      >
        <button className="tool-btn">🌐</button>
      </OverlayTrigger>
    </div>
  );
}
