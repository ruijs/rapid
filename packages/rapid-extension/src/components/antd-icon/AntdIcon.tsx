import * as antdIcons from "@ant-design/icons";
import React from "react";

function isComponentName(name: string): boolean {
  return /^[A-Z]/.test(name);
}

export const iconNames: string[] = [];

for (const componentName in antdIcons) {
  if (!isComponentName(componentName)) {
    continue;
  }

  if (componentName === "IconProvider") {
    continue;
  }

  iconNames.push(componentName);
}

export interface AntdIconProps {
  name: string;
  size?: string;
  color?: string;
  rotate?: number;
  spin?: boolean;
  style?: React.CSSProperties;
  twoToneColor?: string;
}

export default function AntdIcon(props: AntdIconProps): React.ReactElement | null {
  const { name, size, color, rotate, spin, style, twoToneColor } = props;
  const iconComponent = (antdIcons as unknown as Record<string, React.ComponentType<any>>)[name];
  if (!iconComponent) {
    return null;
  }

  return React.createElement(iconComponent, {
    rotate,
    spin,
    style: Object.assign({}, style, {
      fontSize: size,
      color,
    }),
    twoToneColor,
  });
}
