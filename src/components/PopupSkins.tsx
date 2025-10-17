import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  popperGenerator,
  defaultModifiers,
  type Instance,
} from "@popperjs/core/lib/popper-lite";
import offset from "@popperjs/core/lib/modifiers/offset";
import preventOverflow from "@popperjs/core/lib/modifiers/preventOverflow";
import arrow from "@popperjs/core/lib/modifiers/arrow";

import useOnclickOutside from "react-cool-onclickoutside";

import type EmojiSkin from "../interfaces/EmojiSkin";

import "./PopupSkins.css";

interface PopupSkinsProps {
  disabled: boolean;
  offsetProp: [number, number];
  emojiList: EmojiSkin[];
  clickEmoji: (emoji: EmojiSkin) => void;

  onPopperOpenChanged?: (val: boolean) => void;
  onCloseOnClickawayChanged?: (val: boolean) => void;
}

const PopupSkins: React.FC<PopupSkinsProps> = ({
  disabled = false,
  offsetProp = [0, 30],
  emojiList = [],
  clickEmoji,

  onPopperOpenChanged,
  onCloseOnClickawayChanged,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  const [popperOpen, setPopperOpen] = useState(false);
  const [debouncedPopperOpen, setDebouncedPopperOpen] = useState(false);
  const [popperInstance, setPopperInstance] = useState<Instance | null>(null);
  const [closeOnClickaway, setCloseOnClickaway] = useState(true);

  useEffect(() => {
    onPopperOpenChanged?.(popperOpen);

    const timer = setTimeout(() => {
      setDebouncedPopperOpen(popperOpen);
    }, 300);

    return () => clearTimeout(timer);
  }, [popperOpen, onPopperOpenChanged]);

  useEffect(() => {
    onCloseOnClickawayChanged?.(closeOnClickaway);
  }, [closeOnClickaway, onCloseOnClickawayChanged]);

  const onClickOutsideRef = useOnclickOutside(() => {
    if (disabled || !closeOnClickaway) return;

    if (debouncedPopperOpen && popperInstance && containerRef?.current) {
      containerRef.current.removeAttribute("data-show");
      setPopperOpen(false);
      setTimeout(() => {
        popperInstance.forceUpdate?.();
      }, 1);
    }
  });

  const containerSetRefs = useCallback(
    (el: HTMLElement | null) => {
      containerRef.current = el;
      onClickOutsideRef(el);
    },
    [onClickOutsideRef]
  );

  return (
    <div>
      <div ref={containerSetRefs} id="popper-skins-container">
        <div id="skins-arrow" data-popper-arrow />
        <div id="popper-inner">
          <div className="emoji-popover-inner">
            {emojiList.length > 0 && (
              <p className="emoji-list">
                {emojiList.map((emoji) => (
                  <span
                    key={emoji.unicode}
                    dangerouslySetInnerHTML={{ __html: emoji.img }}
                    onClick={() => clickEmoji(emoji)}
                  />
                ))}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupSkins;
