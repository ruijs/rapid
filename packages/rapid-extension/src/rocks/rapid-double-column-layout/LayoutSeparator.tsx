import { useState } from "react";

const mergeClassNames = (...args: any[]) => args.filter(Boolean).join(" ");

const LayoutSeparator = ({ id = "drag-bar", dir, isDragging, disabled, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      id={id}
      data-testid={id}
      tabIndex={disabled ? -1 : 0}
      className={mergeClassNames(
        "rapid-double-column-layout--handle",
        dir === "horizontal" && "rapid-double-column-layout--horizontal",
        !disabled && (isDragging || isFocused) && "rapid-double-column-layout--handle--dragging",
        disabled && "disabled",
      )}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
};

export default LayoutSeparator;
