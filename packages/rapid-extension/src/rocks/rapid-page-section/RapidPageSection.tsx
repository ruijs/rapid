import { Rock } from "@ruiapp/move-style";
import { renderRock, renderRockChildren } from "@ruiapp/react-renderer";
import { RapidPageSectionRockConfig } from "./rapid-page-section-types";
import RapidPageSectionMeta from "./RapidPageSectionMeta";

import "./RapidPageSection.css";

export default {
  $type: "rapidPageSection",

  Renderer(context: any, props: RapidPageSectionRockConfig) {
    const { scope } = context;

    const { title, style, actions } = props;

    return (
      <div style={style} className="rapid-page-section">
        {title && (
          <div className="rapid-page-section-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="rapid-page-section-title">{title}</h2>
              {actions && actions.length > 0 && (
                <div className="rapid-page-section-actions">{actions.map((action: any, index: number) => renderRock({ context, rockConfig: action }))}</div>
              )}
            </div>
          </div>
        )}
        <div className="rapid-page-section-body">
          {renderRockChildren({
            context,
            rockChildrenConfig: props.children,
          })}
        </div>
      </div>
    );
  },

  ...RapidPageSectionMeta,
} as Rock;
