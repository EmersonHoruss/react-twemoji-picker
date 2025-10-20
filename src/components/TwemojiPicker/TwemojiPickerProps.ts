import type { Placement } from "@popperjs/core";
import type { ReactNode } from "react";

export interface TwemojiPickerProps {
  emojiPickerDisabled?: boolean;
  pickerWidth?: number | string;
  pickerHeight?: number;
  pickerPlacement?: Placement;
  pickerArrowEnabled?: boolean;
  pickerAutoflip?: boolean;
  pickerCloseOnClickaway?: boolean;
  triggerType?: "click" | "hover";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emojiData?: Array<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emojiGroups?: Array<any>;
  recentEmojisFeat?: boolean;
  recentEmojisStorage?: "local" | "session" | "none";
  recentEmojiStorageName?: string;
  recentEmojiLimit?: number;
  searchEmojisFeat?: boolean;
  searchEmojiPlaceholder?: string;
  isLoadingLabel?: string;
  searchEmojiNotFound?: string;
  twemojiPath?: string;
  twemojiExtension?: ".png" | ".svg" | ".jpg" | ".jpeg" | ".ico";
  twemojiFolder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  randomEmojiArray?: Array<any>;
  pickerPaddingOffset?: number;
  emojiTextWeightChanged?:false

  onAddTextBlur?: (emojiUnicode: string) => void;
  onEmojiUnicodeAdded?: (emojiUnicode: string) => void;
  onEmojiImgAdded?: (emojiImg: string) => void;

  buttonSlot?: ReactNode;
}

export const DEFAULT_PICKER_WIDTH = 250;

export const DEFAULT_RANDOM_EMOJI_ARRAY = [
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
];
