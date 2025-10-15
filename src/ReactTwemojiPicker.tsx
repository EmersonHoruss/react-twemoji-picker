import React from "react";

export interface ReactTwemojiPickerProps {
  onSelect?: (emoji: string) => void;
}

const emojis = ["😀", "😂", "😍", "😎", "😭", "😡", "👍", "🎉"];

const ReactTwemojiPicker: React.FC<ReactTwemojiPickerProps> = ({
  onSelect,
}) => {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {emojis.map((emoji) => (
        <span
          key={emoji}
          onClick={() => onSelect?.(emoji)}
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default ReactTwemojiPicker;
