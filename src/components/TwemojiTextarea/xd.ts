import React, { useCallback, useEffect, useRef, useState } from "react";
import { TextareaParser } from "./TextareaParser";
import { EmojiService } from "./EmojiService";
import TwitterText from "twitter-text";

interface Props {
  maxlength: number;
  emojiPickerDisabled?: boolean;
  twemojiOptions?: any;
  emojiTextWeightChanged?: boolean;
  onContentChangedHtml?: (content: string) => void;
  onUpdateContent?: (content: string) => void;
  onActualContentLengthChanged?: (length: number) => void;
  onIsContentOverflowed?: (isOverflowed: boolean) => void;
  onEnterKey?: (event: KeyboardEvent) => void;
  onEmojiUnicodeAdded?: (unicode: string) => void;
  onEmojiImgAdded?: (img: string) => void;
}

export const TwemojiTextarea: React.FC<Props> = ({
  maxlength,
  emojiPickerDisabled,
  twemojiOptions,
  emojiTextWeightChanged,
  
  onContentChangedHtml,
  onUpdateContent
  onActualContentLengthChanged,
  onIsContentOverflowed,
  onEnterKey,
  onEmojiUnicodeAdded,
  onEmojiImgAdded,
}) => {
  const textareaRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [actualContentLength, setActualContentLength] = useState(0);

  // 🔹 updateContent (equivalente a Vue)
  const updateContent = useCallback(
    (event: Event) => {
      const targetedElement = event.target as HTMLElement;
      let content = targetedElement.innerHTML;

      onContentChangedHtml?.(content);

      content = TextareaParser.replaceEmojiWithAltAttribute(content);
      content = TextareaParser.unescapeHtml(content);

      if (content.length !== 0 && content[content.length - 1] === '\n') {
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
    [emojiTextWeightChanged, onContentChangedHtml, onUpdateContent, onActualContentLengthChanged]
  );

  // 🔹 Emitir si excede longitud
  const emitIsContentOverflowed = useCallback(() => {
    const overflowed = actualContentLength > maxlength;
    onIsContentOverflowed?.(overflowed);
  }, []);

  // 🔹 Evento Enter normal
  const emitEnterKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      emitIsContentOverflowed();
      onEnterKey?.(event);
    },
    [emitIsContentOverflowed, onEnterKey]
  );

  // 🔹 Enter sin Shift
  const enterKey = useCallback(
    (event: KeyboardEvent) => {
      if (!event.shiftKey) {
        event.preventDefault();
        emitIsContentOverflowed();
        emitEnterKeyEvent(event);
      }
    },
    [emitIsContentOverflowed, emitEnterKeyEvent]
  );

  // 🔹 Shift + Enter
  const shiftEnterKey = useCallback(
    (event: KeyboardEvent) => {
      event.stopPropagation();
      event.preventDefault();

      const el = textareaRef.current;
      if (!el) return;

      if (!el.innerHTML || !el.innerHTML.endsWith("\n")) {
        addText("\n\n");
      } else {
        addText("\n");
      }

      el.scrollTop = el.scrollHeight;
    },
    []
  );

  // 🔹 Pegar texto
  const onPaste = useCallback(
    (pasteEvent: ClipboardEvent) => {
      pasteEvent.stopPropagation();
      pasteEvent.preventDefault();

      const clipboardData = pasteEvent.clipboardData;
      let pastedData = clipboardData?.getData("Text") || "";
      pastedData = TextareaParser.escapeHTML(pastedData);
      pastedData = EmojiService.getEmojiImgFromUnicode(pastedData, twemojiOptions);

      document.execCommand("insertHTML", false, pastedData);

      if (textareaRef.current)
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    },
    [twemojiOptions]
  );

  // 🔹 Focus y blur
  const focus = useCallback(() => {
    const doc = textareaRef.current;
    if (!doc) return;

    const childNode = doc.childNodes[0];
    doc.focus();

    if (!childNode) {
      const textNode = document.createTextNode("");
      doc.appendChild(textNode);
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(doc.childNodes[0], 0);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
      saveSelection();
    }
  }, []);

  const blur = useCallback(() => {
    textareaRef.current?.blur();
  }, []);

  // 🔹 Guardar y restaurar selección
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0);
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const doc = textareaRef.current;
    if (!doc || !savedRange.current) return;
    doc.focus();
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(savedRange.current);
  }, []);

  // 🔹 Insertar texto
  const addText = useCallback(
    (text: string) => {
      focus();
      text = TextareaParser.escapeHTML(text);
      text = EmojiService.getEmojiImgFromUnicode(text, twemojiOptions);
      document.execCommand("insertHTML", false, text);
      saveSelection();
    },
    [focus, saveSelection, twemojiOptions]
  );

  const addTextBlur = useCallback(
    (text: string) => {
      addText(text);
      blur();
    },
    [addText, blur]
  );

  // 🔹 Limpiar contenido
  const cleanText = useCallback(() => {
    if (textareaRef.current) textareaRef.current.innerHTML = "";
    onUpdateContent?.("");
  }, [onUpdateContent]);

  // 🔹 Emojis
  const emojiUnicodeAdded = useCallback(
    (unicode: string) => onEmojiUnicodeAdded?.(unicode),
    [onEmojiUnicodeAdded]
  );

  const emojiImgAdded = useCallback(
    (img: string) => onEmojiImgAdded?.(img),
    [onEmojiImgAdded]
  );

  // 🔹 Efecto inicial
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.addEventListener("paste", onPaste as any);
    el.addEventListener("input", updateContent as any);

    return () => {
      el.removeEventListener("paste", onPaste as any);
      el.removeEventListener("input", updateContent as any);
    };
  }, [onPaste, updateContent]);

  return (
    <div
      ref={textareaRef}
      contentEditable={!emojiPickerDisabled}
      onKeyDown={(e) =>
        e.key === "Enter"
          ? e.shiftKey
            ? shiftEnterKey(e.nativeEvent)
            : enterKey(e.nativeEvent)
          : null
      }
      className="twemoji-textarea"
    />
  );
};
