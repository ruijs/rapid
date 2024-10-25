import { type Rock } from "@ruiapp/move-style";
import { RapidResizableLayoutRockConfig } from "./rapid-resizable-layout-types";
import RapidResizableLayoutMeta from "./RapidResizableLayoutMeta";
import { PanelResizeHandle, Panel, PanelGroup } from "react-resizable-panels";
import { ClientOnlySuspense } from "../../components";
import { renderRock } from "@ruiapp/react-renderer";

import "./rapid-resizable-layout-style.css";

export default {
  Renderer(context, props) {
    const { direction = "horizontal" } = props;

    const layoutRenderer = (layouts: RapidResizableLayoutRockConfig["layouts"]) => {
      if (!layouts?.length) {
        return;
      }

      return layouts.map((layout, i) => {
        const key = layout.key || `${layout.kind}_${i}`;
        switch (layout.kind) {
          case "panel":
            return (
              <Panel {...layout.props} key={key} defaultSize={layout.defaultSize} maxSize={layout.maxSize} minSize={layout.minSize}>
                {renderRock({ context, rockConfig: layout.children })}
              </Panel>
            );
          case "resizehandle":
            const { resizable = true } = props;
            const disabled = !resizable || layout.disabled;
            let className = layout.props?.className || "";
            if (!disabled) {
              className = `rapid-resizable-layout-handler ${className}`;
            }

            return (
              <PanelResizeHandle {...layout.props} className={className} key={key} disabled={disabled} hitAreaMargins={layout.hitAreaMargins}>
                {!disabled && (
                  <div className={direction === "vertical" ? "rapid-resizable-layout-handler--vertical" : "rapid-resizable-layout-handler--horizontal"}></div>
                )}
              </PanelResizeHandle>
            );
          default:
            return "";
        }
      });
    };

    return (
      <ClientOnlySuspense>
        <PanelGroup autoSaveId={props.layoutCacheId || props.$id} direction={direction} className={props.className} style={props.style}>
          {layoutRenderer(props.layouts)}
        </PanelGroup>
      </ClientOnlySuspense>
    );
  },

  ...RapidResizableLayoutMeta,
} as Rock<RapidResizableLayoutRockConfig>;
