import React from "react";
import EmojiService from "../../services/EmojiService";

import PopupEmoji from "../PopupEmoji";
// import PopupSkins from "../PopupSkins";

import type EmojiPack from "../../interfaces/EmojiPack";
import type Emoji from "../../interfaces/Emoji";
import type TwemojiOptions from "../../interfaces/TwemojiOptions";
import type EmojiGroup from "../../interfaces/EmojiGroup";
import type { Placement } from "@popperjs/core";

import "./TwemojiPicker.css";

interface TwemojiPickerProps {
  emojiPickerDisabled: boolean;
  pickerWidth: [number, string];
  pickerHeight: number;
  pickerPlacement: Placement;
  pickerArrowEnabled: boolean;
  pickerAutoflip: boolean;
  pickerCloseOnClickaway: boolean;
  triggerType: "click" | "hover";
  emojiData: Array<any>;
  emojiGroups: Array<any>;
  skinsSelection: boolean;
  recentEmojisFeat: boolean;
  recentEmojisStorage: "local" | "session" | "none";
  recentEmojiStorageName: string;
  recentEmojiLimit: number;
  searchEmojisFeat: boolean;
  searchEmojiPlaceholder: string;
  isLoadingLabel: string;
  searchEmojiNotFound: string;
  twemojiPath: string;
  twemojiExtension: ".png" | ".svg" | ".jpg" | ".jpeg" | ".ico";
  twemojiFolder: string;
  randomEmojiArray: Array<any>;
  pickerPaddingOffset: number;
  emojiTextWeightChanged: boolean;
}

const DEFAULT_PICKER_WIDTH = 250;

const TwemojiPicker: React.FC<TwemojiPickerProps> = ({
  emojiPickerDisabled = false,
  pickerWidth = DEFAULT_PICKER_WIDTH,
  pickerHeight = 150,
  pickerPlacement = "top-start",
  pickerArrowEnabled = true,
  pickerAutoflip = true,
  pickerCloseOnClickaway = true,
  triggerType = "click",
  emojiData = [],
  emojiGroups = [],
  skinsSelection = false,
  recentEmojisFeat = false,
  recentEmojisStorage = "none",
  recentEmojiStorageName = "vue-recent-twemojis",
  recentEmojiLimit = 12,
  searchEmojisFeat = false,
  searchEmojiPlaceholder = "Search emojis.",
  isLoadingLabel = "Loading...",
  searchEmojiNotFound = "No emojis found.",
  twemojiPath = "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/",
  twemojiExtension = ".png",
  twemojiFolder = "72x72",
  randomEmojiArray = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "🥴",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🧐",
  ],
  pickerPaddingOffset = 5,
  emojiTextWeightChanged = false,
}) => {
  const containerSlot = (
    <div id="emoji-container">
      <div id="emoji-popup" style={{ width: `${calculatedPickerWidth}px` }}>
        {searchEmojisFeat && (
          <div id="emoji-popover-search">
            <div
              id="search-header"
              className={isSearchFocused ? "is-focused" : ""}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: getEmojiImgFromUnicode("🔍"),
                }}
              ></span>
              <input
                placeholder={searchEmojiPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onInput={searchEmojiByTerm}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>
        )}
      </div>

      <div id="emoji-popover-header" className="scroll-min">
        {recentEmojisFeat && recentEmojis.length !== 0 && (
          <span
            dangerouslySetInnerHTML={{
              __html: getEmojiImgFromUnicode("🕒"),
            }}
            className={`emoji-tab ${emojiGroupActive === -1 ? "active" : ""}`}
            onClick={() => changeEmojiListActive(-1)}
          />
        )}

        {emojiPack.map((emojiGroup, index) => (
          <span
            key={emojiGroup.group}
            id={emojiGroup.group}
            dangerouslySetInnerHTML={{
              __html: getEmojiGroupDescription(emojiGroup.group),
            }}
            className={`emoji-tab ${
              emojiGroupActive === index ? "active" : ""
            }`}
            onClick={() => changeEmojiListActive(index)}
          />
        ))}
        <span />
      </div>

      <div
        className="emoji-popover-inner"
        style={{
          width: `${calculatedPickerWidth}px`,
          height: `${pickerHeight}px`,
        }}
      >
        {isSearchingEmoji && (
          <div>
            <strong style={{ padding: "3px" }} id="loading-label">
              {isLoadingLabel}
            </strong>
          </div>
        )}

        {searchTerm.length !== 0 &&
          searchEmojis.length === 0 &&
          isSearchingEmoji === false && (
            <div>
              <strong style={{ padding: "3px" }}>
                {{ searchEmojiNotFound }}
              </strong>
            </div>
          )}

        {emojiListActive.length !== 0 && isSearchingEmoji === false && (
          <div>
            <p className="emoji-list">
              {emojiListActive.map((emoji) => (
                <span
                  id={`twemoji-picker-click-emoji-${emoji.unicode}`}
                  key={emoji.unicode}
                  dangerouslySetInnerHTML={{ __html: emoji.img }}
                  onClick={() => clickEmoji(emoji)}
                  onMouseDown={() => startClickingSkinInterval(emoji)}
                  onMouseLeave={stopClickingSkinInterval}
                  onMouseUp={stopClickingSkinInterval}
                  onTouchStart={() => startClickingSkinInterval(emoji)}
                  onTouchEnd={stopClickingSkinInterval}
                  onTouchCancel={stopClickingSkinInterval}
                />
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const buttonSlot = (
    <button
      id="btn-emoji-default"
      disabled={emojiPickerDisabled}
      onMouseEnter={onMouseEnterEmojiBtn}
      onMouseLeave={onMouseLeaveEmojiBtn}
    >
      {showEmoji ? (
        <div
          className="fade-in"
          dangerouslySetInnerHTML={{ __html: randomEmojiImg }}
        />
      ) : (
        <div id="dummy-el" />
      )}
    </button>
  );

  return (
    <div>
      {emojiData && emojiData.length > 0 && (
        <PopupEmoji
          disabled={emojiPickerDisabled}
          placement={pickerPlacement}
          autoflip={pickerAutoflip}
          arrowEnabled={pickerArrowEnabled}
          triggerType={triggerType}
          extraPaddingOffset={pickerPaddingOffset}
          closeOnClickaway={pickerCloseOnClickaway}
          containerSlot={containerSlot}
          buttonSlot={buttonSlot}
        />
      )}
      <span id="dummy-clickable-skin" />
    </div>
  );
};

export default TwemojiPicker;
