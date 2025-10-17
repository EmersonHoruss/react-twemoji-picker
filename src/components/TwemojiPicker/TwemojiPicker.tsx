import React from "react";
import EmojiService from "../../services/EmojiService";

import PopupEmoji from "../PopupEmoji";
import PopupSkins from "../PopupSkins";

import type EmojiPack from "../../interfaces/EmojiPack";
import type Emoji from "../../interfaces/Emoji";
import type TwemojiOptions from "../../interfaces/TwemojiOptions";
import type EmojiGroup from "../../interfaces/EmojiGroup";
import type { Placement } from "@popperjs/core";

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
  return (
    <div>
      <span id="dummy-clickable-skin" />
    </div>
  );
};

export default TwemojiPicker;
