import React, { useCallback, useEffect, useRef, useState } from "react";

import "./TwemojiTextarea.css";
import {
  DEFAULT_PICKER_WIDTH,
  DEFAULT_RANDOM_EMOJI_ARRAY,
  type TwemojiPickerProps,
} from "../TwemojiPicker/TwemojiPickerProps";
import TwemojiPicker from "../TwemojiPicker/TwemojiPicker";
import SendIconImg from "../SendIconImg/SendIconImg";
import TextareaParser from "../../services/TextareaParser";
import EmojiService from "../../services/EmojiService";

import TwitterText from "twitter-text";

interface TwemojiTextareaProps extends TwemojiPickerProps {
  idTextarea?: string;
  initialContent?: string;
  enableSendBtn?: boolean;
  emojiPickerDisabled?: boolean;
  textareaDisabled?: boolean;
  componentColor?: string;
  placeholder?: string;
  maxlength?: number;

  onContentChangedHtml?: (content: string) => void;
  onUpdateContent?: (content: string) => void;
  onActualContentLengthChanged?: (length: number) => void;
  onIsContentOverflowed?: (isOverflowed: boolean) => void;
  onEnterKey?: (
    event:
      | React.KeyboardEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement>
  ) => void;
  onEmojiUnicodeAdded?: (unicode: string) => void;
  onEmojiImgAdded?: (img: string) => void;
}

const TwemojiTextarea: React.FC<TwemojiTextareaProps> = ({
  idTextarea = "twemoji-textarea-outer",
  initialContent = "",
  enableSendBtn = false,
  textareaDisabled = false,
  componentColor = "#F7F7F7",
  placeholder = "",
  maxlength = null,

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
  emojiTextWeightChanged = false,
  buttonSlot,

  onContentChangedHtml,
  onUpdateContent,
  onActualContentLengthChanged,
  onIsContentOverflowed,
  onEnterKey,
  onEmojiUnicodeAdded,
  onEmojiImgAdded,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedRange, setSavedRange] = useState<any>(null);
  const [twemojiOptions, setTwemojiOptions] = useState<TwemojiOptions>(
    {} as TwemojiOptions
  );
  const [actualContentLength, setActualContentLength] = useState<number>(0);

  const twemojiTextareaRef = useRef<HTMLDivElement>(null);

  const updateContent = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      const targetedElement = event.target as HTMLElement;
      let content = targetedElement.innerHTML;

      onContentChangedHtml?.(content);

      content = TextareaParser.replaceEmojiWithAltAttribute(content);
      content = TextareaParser.unescapeHtml(content);

      if (content.length !== 0 && content[content.length - 1] === "\n") {
        content = content.slice(0, -1);
      }

      const length = emojiTextWeightChanged
        ? TwitterText.parseTweet(content || "", {
            maxWeightedTweetLength: 280,
            scale: 100,
            defaultWeight: 100,
          }).weightedLength
        : TwitterText.parseTweet(content || "").weightedLength;

      setActualContentLength(length);
      onUpdateContent?.(content);
      onActualContentLengthChanged?.(length);
      onContentChangedHtml?.(content);
    },
    [
      emojiTextWeightChanged,
      onUpdateContent,
      onActualContentLengthChanged,
      onContentChangedHtml,
    ]
  );

  const emitIsContentOverflowed = useCallback(() => {
    if (!maxlength) return;

    const overflowed = actualContentLength > maxlength;

    onIsContentOverflowed?.(overflowed);
  }, [actualContentLength, maxlength, onIsContentOverflowed]);

  const emitEnterKeyEvent = useCallback(
    (
      event:
        | React.KeyboardEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement>
    ) => {
      emitIsContentOverflowed();
      onEnterKey?.(event);
    },
    [emitIsContentOverflowed, onEnterKey]
  );

  const enterKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!event.shiftKey) {
        event.preventDefault();
        emitIsContentOverflowed();
        emitEnterKeyEvent(event);
      }
    },
    [emitEnterKeyEvent, emitIsContentOverflowed]
  );

  const saveSelection = useCallback(() => {
    setSavedRange(window.getSelection()?.getRangeAt(0));
  }, []);

  const focus = useCallback(() => {
    const doc = twemojiTextareaRef.current;
    if (!doc) return;

    const childNode = doc.childNodes[0];
    doc.focus();

    if (childNode !== undefined) return;

    const textNode = document.createTextNode("");
    doc.appendChild(textNode);
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(doc.childNodes[0], 0);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
    saveSelection();
  }, [saveSelection]);

  const addText = useCallback(
    (text: string) => {
      focus();

      let textAux = TextareaParser.escapeHTML(text);
      textAux = EmojiService.getEmojiImgFromUnicode(textAux, twemojiOptions);

      document.execCommand("insertHTML", false, textAux);

      saveSelection();
    },
    [focus, saveSelection, twemojiOptions]
  );

  const shiftEnterKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();

      const el = twemojiTextareaRef.current;
      if (!el) return;

      if (
        el.innerHTML === "" ||
        el.innerHTML[el.innerHTML.length - 1] !== "\n"
      ) {
        addText("\n");
        addText("\n");
      } else {
        addText("\n");
      }

      el.scrollTop = el.scrollHeight;
    },
    [addText]
  );

  const onPaste = useCallback(
    (pasteEvent: React.ClipboardEvent<HTMLDivElement>) => {
      pasteEvent.stopPropagation();
      pasteEvent.preventDefault();

      const clipboardData = pasteEvent.clipboardData;
      let pastedData = clipboardData?.getData("Text") || "";
      pastedData = TextareaParser.escapeHTML(pastedData);
      pastedData = EmojiService.getEmojiImgFromUnicode(
        pastedData,
        twemojiOptions
      );

      document.execCommand("insertHTML", false, pastedData);

      if (twemojiTextareaRef?.current)
        twemojiTextareaRef.current.scrollTop =
          twemojiTextareaRef.current.scrollHeight;
    },
    [twemojiOptions]
  );

  const blur = useCallback(() => {
    twemojiTextareaRef?.current?.blur();
  }, []);

  const restoreSelection = useCallback(() => {
    if (!twemojiTextareaRef?.current) return;

    twemojiTextareaRef.current?.focus();

    if (savedRange == null) return;

    const s = window.getSelection();
    if (s?.rangeCount) {
      s?.removeAllRanges();
    }
    s?.addRange(savedRange);
  }, [savedRange]);

  const addTextBlur = useCallback(
    (text: string) => {
      addText(text);
      blur();
    },
    [addText, blur]
  );

  const emojiUnicodeAdded = useCallback(
    (unicode: string) => {
      onEmojiUnicodeAdded?.(unicode);
    },
    [onEmojiUnicodeAdded]
  );

  const emojiImgAdded = useCallback(
    (img: string) => {
      onEmojiImgAdded?.(img);
    },
    [onEmojiImgAdded]
  );

  useEffect(() => {
    setTwemojiOptions({
      base: twemojiPath,
      ext: twemojiExtension,
      size: twemojiFolder,
    });
  }, [twemojiPath, twemojiExtension, twemojiFolder]);

  useEffect(() => {
    if (initialContent.length > 0 && twemojiTextareaRef?.current) {
      twemojiTextareaRef.current.innerHTML = initialContent;

      let content = TextareaParser.replaceEmojiWithAltAttribute(initialContent);
      content = TextareaParser.unescapeHtml(content);
      const length = TwitterText.parseTweet(content || "").weightedLength;

      setActualContentLength(length);
    }
  }, [initialContent]);

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
        ref={twemojiTextareaRef}
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
        <div id="send-btn" onClick={emitEnterKeyEvent}>
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
