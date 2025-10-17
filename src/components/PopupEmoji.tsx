import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  popperGenerator,
  defaultModifiers,
} from "@popperjs/core/lib/popper-lite";
import flip from "@popperjs/core/lib/modifiers/flip";
import offset from "@popperjs/core/lib/modifiers/offset";
import arrow from "@popperjs/core/lib/modifiers/arrow";
import preventOverflow from "@popperjs/core/lib/modifiers/preventOverflow";
import type { Instance, Modifier, Placement } from "@popperjs/core";
import useOnclickOutside from "react-cool-onclickoutside";
import type PopperObject from "../interfaces/PopperObject";

interface PopupEmojiProps {
  disabled: boolean;
  placement: Placement;
  autoflip: boolean;
  arrowEnabled: boolean;
  triggerType: "click" | "hover";
  extraPaddingOffset: number;
  closeOnClickaway: boolean;

  onPopperOpenChanged?: (val: boolean) => void;
  containerSlot?: React.ReactNode;
  buttonSlot?: React.ReactNode;
}

const PopupEmoji: React.FC<PopupEmojiProps> = ({
  disabled = false,
  placement = "top-start",
  autoflip = false,
  arrowEnabled = false,
  triggerType = "click",
  extraPaddingOffset = 5,
  closeOnClickaway = true,

  onPopperOpenChanged,
  containerSlot,
  buttonSlot,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const [popperOpen, setPopperOpen] = useState(false);
  const [debouncedPopperOpen, setDebouncedPopperOpen] = useState(false);
  const [popperInstance, setPopperInstance] = useState<Instance | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modifiers: Array<Modifier<any, any>> = [
      ...defaultModifiers,
      offset,
      preventOverflow,
    ];
    if (autoflip) modifiers.push(flip);
    if (arrowEnabled) modifiers.push(arrow);

    const createPopper = popperGenerator({
      defaultModifiers: modifiers,
    });

    if (!buttonRef.current || !containerRef.current) return;

    const popperInstanceRef = createPopper(
      buttonRef.current,
      containerRef.current,
      {
        placement,
        modifiers: [
          {
            name: "offset",
            options: {
              offset: ({ placement }: PopperObject) => {
                if (
                  placement.includes("bottom") ||
                  placement.includes("top") ||
                  placement.includes("left") ||
                  placement.includes("right")
                )
                  return [0, extraPaddingOffset];

                return [0, 0];
              },
            },
          },
          {
            name: "arrow",
            options: {
              element: "#arrow",
            },
          },
        ],
      }
    );

    setPopperInstance(popperInstanceRef);

    return () => {
      popperInstanceRef.destroy();
    };
  }, [autoflip, arrowEnabled, placement, extraPaddingOffset]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (popperOpen) el.setAttribute("data-show", "");
    if (!popperOpen) el.removeAttribute("data-show");

    onPopperOpenChanged?.(popperOpen);

    const timer = setTimeout(() => {
      setDebouncedPopperOpen(popperOpen);
    }, 300);

    return () => clearTimeout(timer);
  }, [popperOpen, onPopperOpenChanged]);

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

  const clickTriggerPopper = useCallback(() => {
    if (disabled || triggerType !== "click" || !popperInstance) return;

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const isShown = containerEl.hasAttribute("data-show");
    setPopperOpen(!isShown);

    setTimeout(() => {
      popperInstance.forceUpdate?.();
    }, 1);
  }, [disabled, triggerType, popperInstance]);

  const hoverTriggerPopper = useCallback(() => {
    if (disabled || triggerType !== "hover" || !popperInstance) return;

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const isShown = containerEl.hasAttribute("data-show");
    setPopperOpen(!isShown);

    setTimeout(() => {
      popperInstance.forceUpdate?.();
    }, 1);
  }, [disabled, triggerType, popperInstance]);

  return (
    <div>
      <div
        ref={containerSetRefs}
        id="popper-container"
        onMouseLeave={hoverTriggerPopper}
      >
        <div id={arrowEnabled ? "arrow" : "arrow-disabled"} data-popper-arrow />
        <div id="popper-inner">{containerSlot}</div>
      </div>

      <div
        ref={buttonRef}
        id="popper-button"
        onClick={clickTriggerPopper}
        onMouseEnter={hoverTriggerPopper}
      >
        {buttonSlot}
      </div>
    </div>
  );
};

export default PopupEmoji;
