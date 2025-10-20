import React, { useEffect, useState } from "react";

import "./TwemojiTextarea.css";
import {
  DEFAULT_PICKER_WIDTH,
  DEFAULT_RANDOM_EMOJI_ARRAY,
  type TwemojiPickerProps,
} from "../TwemojiPicker/TwemojiPickerProps";
import TwemojiPicker from "../TwemojiPicker/TwemojiPicker";
import SendIconImg from "../SendIconImg/SendIconImg";

interface TwemojiTextareaProps extends TwemojiPickerProps {
  idTextarea?: string;
  initialContent?: string;
  enableSendBtn?: boolean;
  emojiPickerDisabled?: boolean;
  textareaDisabled?: boolean;
  componentColor?: string;
  placeholder?: string;
  maxlength?: number;
}

const TwemojiTextarea: React.FC<TwemojiTextareaProps> = ({
  idTextarea = "twemoji-textarea-outer",
  initialContent = "",
  enableSendBtn = false,
  emojiPickerDisabled = false,
  textareaDisabled = false,
  componentColor = "#F7F7F7",
  placeholder = "",
  maxlength = null,

  pickerWidth = DEFAULT_PICKER_WIDTH,
  pickerHeight = 150,
  pickerPlacement = "top-start",
  pickerArrowEnabled = true,
  pickerAutoflip = true,
  pickerCloseOnClickaway = true,
  triggerType = "click",
  emojiData = [],
  emojiGroups = [],
  recentEmojisFeat = false,
  recentEmojisStorage = "none",
  recentEmojiStorageName = "vue-recent-twemojis",
  recentEmojiLimit = 12,
  searchEmojisFeat = true,
  searchEmojiPlaceholder = "Search emojis.",
  isLoadingLabel = "Loading...",
  searchEmojiNotFound = "No emojis found.",
  twemojiPath = "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/",
  twemojiExtension = ".png",
  twemojiFolder = "72x72",
  randomEmojiArray = DEFAULT_RANDOM_EMOJI_ARRAY,
  pickerPaddingOffset = 5,
  buttonSlot,
}) => {
  const [savedRange, setSavedRange] = useState<any>(null);
  const [twemojiOptions, setTwemojiOptions] = useState<TwemojiOptions>(
    {} as TwemojiOptions
  );
  const [actualContentLength, setActualContentLength] = useState<number>(0);

  useEffect(() => {
    setTwemojiOptions({
      base: twemojiPath,
      ext: twemojiExtension,
      size: twemojiFolder,
    });
  }, [twemojiPath, twemojiExtension, twemojiFolder]);

  return (
    <div
      id={idTextarea}
      className="twemoji-textarea-outer"
      style={{
        paddingBottom: maxlength ? "15px" : "0px",
        backgroundColor: componentColor,
      }}
    >
      <TwemojiPicker
        emojiPickerDisabled={emojiPickerDisabled}
        pickerWidth={pickerWidth}
        pickerHeight={pickerHeight}
        pickerPlacement={pickerPlacement}
        pickerArrowEnabled={pickerArrowEnabled}
        pickerAutoflip={pickerAutoflip}
        pickerCloseOnClickaway={pickerCloseOnClickaway}
        triggerType={triggerType}
        emojiData={emojiData}
        emojiGroups={emojiGroups}
        recentEmojisFeat={recentEmojisFeat}
        recentEmojisStorage={recentEmojisStorage}
        recentEmojiStorageName={recentEmojiStorageName}
        recentEmojiLimit={recentEmojiLimit}
        searchEmojisFeat={searchEmojisFeat}
        searchEmojiPlaceholder={searchEmojiPlaceholder}
        isLoadingLabel={isLoadingLabel}
        searchEmojiNotFound={searchEmojiNotFound}
        twemojiPath={twemojiPath}
        twemojiExtension={twemojiExtension}
        twemojiFolder={twemojiFolder}
        randomEmojiArray={randomEmojiArray}
        pickerPaddingOffset={pickerPaddingOffset}
        onAddTextBlur={addTextBlur}
        onEmojiUnicodeAdded={emojiUnicodeAdded}
        onEmojiImgAdded={emojiImgAdded}
        buttonSlot={buttonSlot}
      />

      <div
        id="twemoji-textarea"
        className="twemojiTextarea"
        contentEditable={!textareaDisabled}
        onInput={updateContent}
        onPaste={onPaste}
        onKeyDown={(e) => {
          if (!e.shiftKey && e.key === "Enter") enterKey(e);
          else if (e.shiftKey && e.key === "Enter") shiftEnterKey(e);
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onFocus={restoreSelection}
        data-placeholder={placeholder}
      />

      {enableSendBtn && (
        <div id="send-btn" onClick={emiteEnterKeyEvent}>
          <SendIconImg />
        </div>
      )}

      {maxlength && (
        <div id="length-indicator">
          <span
            style={{ color: actualContentLength > maxlength ? "red" : "black" }}
          >
            {actualContentLength}
          </span>
          /<span>{maxlength}</span>
        </div>
      )}
    </div>
  );
};

export default TwemojiTextarea;
