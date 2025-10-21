import React, { useState } from "react";

import TwemojiPicker from "../TwemojiPicker/TwemojiPicker";
import EmojiDataAll from "../../../emoji-data/en/emoji-all-groups.json";
import EmojiGroups from "../../../emoji-data/emoji-groups.json";

import "./Sandbox.css";
import TwemojiTextarea from "../TwemojiTextarea/TwemojiTextarea";

const Sandbox: React.FC = () => {
  const [emojiPickerDisabled, setEmojiPickerDisabled] = useState(false);
  const [emojiTextWeightChanged] = useState<boolean>(false);

  const onClickTest = () => {
    setEmojiPickerDisabled((prev) => !prev);
  };

  return (
    <div id="app">
      <div id="test-picker">
        <TwemojiPicker
          emojiData={EmojiDataAll}
          emojiGroups={EmojiGroups}
          pickerPlacement="left"
          emojiPickerDisabled={emojiPickerDisabled}
          pickerArrowEnabled={false}
          pickerWidth="#buttonson"
          pickerPaddingOffset={-10}
        />
        <button id="buttonson" onClick={onClickTest}>
          Working Test
        </button>
      </div>

      <div>
        <TwemojiTextarea
          pickerAutoflip={false}
          emojiData={EmojiDataAll}
          emojiGroups={EmojiGroups}
          enableSendBtn={true}
          recentEmojisFeat={true}
          recentEmojisStorage={"none"}
          searchEmojisFeat={true}
          placeholder={"Textarea Placeholders"}
          maxlength={100}
          pickerArrowEnabled={true}
          idTextarea={"idTextarea"}
          pickerWidth={"#idTextarea"}
          initialContent={"TEST BUG CONTENT"}
          pickerPaddingOffset={15}
          emojiTextWeightChanged={emojiTextWeightChanged}
        />
        <button onClick={onClickTest}>Working Test</button>
      </div>
    </div>
  );
};

export default Sandbox;
