import { memo, useEffect, useRef } from "react";
import { RapidDoubleColumnLayoutRockConfig } from "./rapid-double-column-layout-types";
import { RockInstanceContext } from "@ruiapp/move-style";
import { useResizable } from "react-resizable-layout";
import { isArray, merge } from "lodash";
import { renderRock, renderRockChildren } from "@ruiapp/react-renderer";
import LayoutSeparator from "./LayoutSeparator";
import { RapidExtStorage } from "../../utils/storage-utility";

const LayoutContainer = memo<RapidDoubleColumnLayoutRockConfig & { context: RockInstanceContext }>((props) => {
  const {
    context,
    fixedColumn = "left",
    layoutCacheId,
    resizable = true,
    defaultFixedColumnWidth = 360,
    fixedChildren: fixedContent,
    flexChildren: flexContent,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const layoutCache = useLayoutCache(layoutCacheId);

  const { position, separatorProps } = useResizable({
    axis: "x",
    initial: layoutCache.get()?.width || defaultFixedColumnWidth,
    containerRef,
    disabled: !resizable || false,
  });

  useEffect(() => {
    layoutCache.set({ width: position || 0 });
  }, [position]);

  return (
    <div className="rapid-double-column-layout" ref={containerRef}>
      {fixedColumn === "right" ? (
        <>
          <div className="rapid-double-column-layout--flex">
            {isArray(flexContent)
              ? renderRockChildren({ context, rockChildrenConfig: flexContent })
              : flexContent
              ? renderRock({ context, rockConfig: flexContent })
              : ""}
          </div>
          <LayoutSeparator disabled={!resizable} {...separatorProps} />
          <div className="rapid-double-column-layout--fixed" style={{ width: position }}>
            {isArray(fixedContent)
              ? renderRockChildren({ context, rockChildrenConfig: fixedContent })
              : fixedContent
              ? renderRock({ context, rockConfig: fixedContent })
              : ""}
          </div>
        </>
      ) : (
        <>
          <div className="rapid-double-column-layout--fixed" style={{ width: position }}>
            {isArray(fixedContent)
              ? renderRockChildren({ context, rockChildrenConfig: fixedContent })
              : fixedContent
              ? renderRock({ context, rockConfig: fixedContent })
              : ""}
          </div>
          <LayoutSeparator disabled={!resizable} {...separatorProps} />
          <div className="rapid-double-column-layout--flex">
            {isArray(flexContent)
              ? renderRockChildren({ context, rockChildrenConfig: flexContent })
              : flexContent
              ? renderRock({ context, rockConfig: flexContent })
              : ""}
          </div>
        </>
      )}
    </div>
  );
});

export default LayoutContainer;

interface ILayoutCacheData {
  width?: number;
  height?: number;
}

function useLayoutCache(id: string) {
  const rapidDoubleColumnLayoutCacheKey = "rapid_double_column_layout_cache_key";
  return {
    get() {
      if (!id) {
        throw new Error("Rock rapidDoubleColumnLayout: Props layoutCacheId is not null!");
      }

      return RapidExtStorage.get(rapidDoubleColumnLayoutCacheKey)?.[id] as ILayoutCacheData;
    },
    set(data: ILayoutCacheData) {
      if (!id) {
        throw new Error("Rock rapidDoubleColumnLayout: Props layoutCacheId is not null!");
      }

      const oldData = RapidExtStorage.get(rapidDoubleColumnLayoutCacheKey) || {};
      RapidExtStorage.set(rapidDoubleColumnLayoutCacheKey, merge(oldData, { [id]: data }));
    },
  };
}
