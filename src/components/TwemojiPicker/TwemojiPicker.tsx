import React, { useCallback, useEffect, useRef, useState } from "react";
import EmojiService from "../../services/EmojiService";

import PopupEmoji from "../PopupEmoji";
import type { PopupEmojiRef } from "../PopupEmoji";

import type EmojiPack from "../../interfaces/EmojiPack";
import type Emoji from "../../interfaces/Emoji";
import type TwemojiOptions from "../../interfaces/TwemojiOptions";
import type EmojiGroup from "../../interfaces/EmojiGroup";
import type { Placement } from "@popperjs/core";

import "./TwemojiPicker.css";
import type EmojiSkin from "../../interfaces/EmojiSkin";

interface TwemojiPickerProps {
  emojiPickerDisabled: boolean;
  pickerWidth: number | string;
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

  onAddTextBlur?: (emojiUnicode: string) => void;
  onEmojiUnicodeAdded?: (emojiUnicode: string) => void;
  onEmojiImgAdded?: (emojiImg: string) => void;
}

const DEFAULT_PICKER_WIDTH = 250;
const DEFAULT_RANDOM_EMOJI_ARRAY = [
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
  randomEmojiArray = DEFAULT_RANDOM_EMOJI_ARRAY,
  pickerPaddingOffset = 5,
  emojiTextWeightChanged = false,

  onAddTextBlur,
  onEmojiUnicodeAdded,
  onEmojiImgAdded,
}) => {
  const [clickingSkinInterval, setClickingSkinInterval] = useState<any>(false);
  const [isClickingEmojiMouseDown, setIsClickingEmojiMouseDown] =
    useState<boolean>(false);
  const [popupSkinsClickaway, setPopupSkinsClickaway] = useState<boolean>(true);

  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [showSkinsSelector, setShowSkinsSelector] = useState<boolean>(false);
  const [skinsListActive, setSkinsListActive] = useState<EmojiSkin[]>([]);

  const [emojiPack, setEmojiPack] = useState<EmojiPack[]>([]);
  const [emojiListActive, setEmojiListActive] = useState<Emoji[]>([]);
  const [emojiGroupActive, setEmojiGroupActive] = useState<number>(0);

  const [randomEmoji, setRandomEmoji] = useState<string | null>(null);

  const [isPointerOnEmojiBtn, setIsPointerOnEmojiBtn] =
    useState<boolean>(false);
  const [twemojiOptions, setTwemojiOptions] = useState<TwemojiOptions | null>(
    null
  );

  const [recentEmojis, setRecentEmojis] = useState<Emoji[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchEmojis, setSearchEmojis] = useState<Emoji[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);
  const [isSearchingEmoji, setIsSearchingEmoji] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [calculatedPickerWidth, setCalculatedPickerWidth] = useState<
    number | null
  >(null);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const popupEmojiRef = useRef<PopupEmojiRef>(null);

  const triggerShowEmoji = useCallback(() => {
    setShowEmoji(false);

    const timer = setTimeout(() => {
      setShowEmoji(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const buildEmojiPack = useCallback(() => {
    if (!twemojiOptions) return;

    const pack = EmojiService.getEmojiImgArrayFromEmojiPack(
      emojiData,
      twemojiOptions
    );
    setEmojiPack(pack);
  }, [emojiData, twemojiOptions]);

  const setRandomEmojiFunc = useCallback(() => {
    const emoji =
      randomEmojiArray[Math.floor(Math.random() * randomEmojiArray.length)];
    setRandomEmoji(emoji);
  }, [randomEmojiArray]);

  const onMouseEnterEmojiBtn = useCallback(() => {
    if (isPointerOnEmojiBtn === false) {
      setIsPointerOnEmojiBtn(true);
      setRandomEmojiFunc();
    }
  }, [isPointerOnEmojiBtn, setRandomEmojiFunc]);

  const onMouseLeaveEmojiBtn = useCallback(() => {
    if (isPointerOnEmojiBtn) {
      setIsPointerOnEmojiBtn(false);
    }
  }, [isPointerOnEmojiBtn]);

  const addEmojiToRecentEmojis = useCallback(
    (emojiUnicode: string) => {
      setRecentEmojis((prev) => {
        if (!twemojiOptions) return prev;

        let updated = [...prev];

        const indexToRemove = updated.findIndex(
          (x) => x.unicode === emojiUnicode
        );
        if (indexToRemove !== -1) {
          updated.splice(indexToRemove, 1);
        }

        updated.unshift({
          unicode: emojiUnicode,
          img: EmojiService.getEmojiImgFromUnicode(
            emojiUnicode,
            twemojiOptions
          ),
          skins: [],
          tags: [],
        });

        if (updated.length > recentEmojiLimit) {
          updated = updated.slice(0, recentEmojiLimit);
        }

        if (recentEmojisStorage === "local") {
          localStorage.setItem(recentEmojiStorageName, JSON.stringify(updated));
        } else if (recentEmojisStorage === "session") {
          sessionStorage.setItem(
            recentEmojiStorageName,
            JSON.stringify(updated)
          );
        }

        return updated;
      });
    },
    [
      recentEmojiLimit,
      recentEmojiStorageName,
      recentEmojisStorage,
      twemojiOptions,
    ]
  );

  const clickEmoji = useCallback(
    (emoji: Emoji) => {
      const emojiUnicode = emoji.unicode;

      if (recentEmojisFeat) addEmojiToRecentEmojis(emojiUnicode);

      onAddTextBlur?.(emojiUnicode);
      onEmojiUnicodeAdded?.(emojiUnicode);

      if (twemojiOptions) {
        const emojiImg = EmojiService.getEmojiImgFromUnicode(
          emojiUnicode,
          twemojiOptions
        );
        onEmojiImgAdded?.(emojiImg);
      }
    },
    [
      addEmojiToRecentEmojis,
      onAddTextBlur,
      onEmojiImgAdded,
      onEmojiUnicodeAdded,
      recentEmojisFeat,
      twemojiOptions,
    ]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startClickingSkinInterval = useCallback((_emoji: Emoji) => {
    setIsClickingEmojiMouseDown(false);
  }, []);

  const stopClickingSkinInterval = useCallback(() => {
    setIsClickingEmojiMouseDown(false);
  }, []);

  const getEmojiGroupDescription = useCallback(
    (emojiGroup: number) => {
      const emojiGroupFound = emojiGroups.find(
        (x: EmojiGroup) => x.group === emojiGroup
      );
      if (emojiGroupFound && twemojiOptions) {
        return EmojiService.getEmojiImgFromUnicode(
          emojiGroupFound.description,
          twemojiOptions
        );
      }
      return "Group " + emojiGroup;
    },
    [emojiGroups, twemojiOptions]
  );

  const changeEmojiListActive = useCallback(
    (index: number) => {
      setShowSkinsSelector(false);
      setSearchTerm("");
      setEmojiGroupActive(index);

      if (index >= 0) {
        setEmojiListActive(emojiPack[index].emojiList);
      } else if (index === -1) {
        setEmojiListActive(recentEmojis);
      }
    },
    [emojiPack, recentEmojis]
  );

  const getEmojiImgFromUnicode = useCallback(
    (unicode: string): string => {
      if (!twemojiOptions) return "";
      return EmojiService.getEmojiImgFromUnicode(unicode, twemojiOptions);
    },
    [twemojiOptions]
  );

  const setRecentEmojisFunc = useCallback(() => {
    let emojis: Emoji[] = [];

    if (recentEmojisStorage === "local") {
      emojis = JSON.parse(localStorage.getItem(recentEmojiStorageName) || "[]");
    } else if (recentEmojisStorage === "session") {
      emojis = JSON.parse(
        sessionStorage.getItem(recentEmojiStorageName) || "[]"
      );
    }

    if (emojis) setRecentEmojis(emojis);
  }, [recentEmojiStorageName, recentEmojisStorage]);

  const searchEmojiByTerm = useCallback(() => {
    setIsSearchingEmoji(true);

    if (searchTerm.length > 0) {
      const timeout = setTimeout(() => {
        if (!twemojiOptions) return;
        const emojis = EmojiService.getEmojiImgArrayFromEmojiPackByTerm(
          emojiData,
          twemojiOptions,
          searchTerm
        );
        setEmojiGroupActive(-2);
        setEmojiListActive(emojis);
        setShowSkinsSelector(false);
        setIsSearchingEmoji(false);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      changeEmojiListActive(0);
      setIsSearchingEmoji(false);
    }
  }, [changeEmojiListActive, emojiData, searchTerm, twemojiOptions]);

  const popperOpenChanged = useCallback((popperOpen: boolean) => {
    setIsPickerOpen(popperOpen);
  }, []);

  const setPickerWidth = useCallback(() => {
    if (typeof pickerWidth === "string" && pickerWidth.startsWith("#")) {
      const domId = pickerWidth.slice(1);
      const domEl = document.getElementById(domId);
      if (domEl) setCalculatedPickerWidth(domEl.offsetWidth - 8);
    } else if (typeof pickerWidth === "number") {
      setCalculatedPickerWidth(pickerWidth);
    } else {
      setCalculatedPickerWidth(DEFAULT_PICKER_WIDTH);
    }
  }, [pickerWidth]);

  useEffect(() => {
    setPickerWidth();

    window.addEventListener("resize", setPickerWidth);

    return () => {
      window.removeEventListener("resize", setPickerWidth);
    };
  }, [setPickerWidth]);

  useEffect(() => {
    const popup = popupEmojiRef.current;
    if (!popup) return;

    if (isPickerOpen !== popup.popperOpen) {
      popup.setPopperOpen(isPickerOpen);
      setTimeout(() => {
        popup.popperInstance?.forceUpdate();
      }, 1);
    }
  }, [isPickerOpen]);

  useEffect(() => {
    const popup = popupEmojiRef.current;
    if (!popup) return;

    setTimeout(() => {
      popup.popperInstance?.forceUpdate();
    }, 100);
  }, [randomEmoji]);

  useEffect(() => {
    const popup = popupEmojiRef.current;
    if (!popup) return;

    if (emojiPickerDisabled) {
      popup.setPopperOpen(false);
    }
  }, [emojiPickerDisabled]);

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
