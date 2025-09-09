import { Rock } from "@ruiapp/move-style";
import { renderRockChildren } from "@ruiapp/react-renderer";
import { RapidPageSectionRockConfig } from "./rapid-page-section-types";
import RapidPageSectionMeta from "./RapidPageSectionMeta";

import "./RapidPageSection.css";

export default {
  $type: "rapidPageSection",

  Renderer(context, props: RapidPageSectionRockConfig) {
    const { scope } = context;

    const { title, style } = props;

    return (
      <div style={style} className="rapid-page-section">
        {title && (
          <div className="rapid-page-section-header">
            <h2 className="rapid-page-section-title">{title}</h2>
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
