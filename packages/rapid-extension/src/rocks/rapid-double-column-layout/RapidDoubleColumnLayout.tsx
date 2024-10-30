import { type Rock } from "@ruiapp/move-style";
import { RapidDoubleColumnLayoutRockConfig } from "./rapid-double-column-layout-types";
import RapidDoubleColumnLayoutMeta from "./RapidDoubleColumnLayoutMeta";
import { ClientOnlySuspense } from "../../components";
import LayoutContainer from "./LayoutContainer";

import "./rapid-double-column-layout-style.css";

export default {
  Renderer(context, props) {
    return (
      <ClientOnlySuspense>
        <LayoutContainer {...props} context={context} />
      </ClientOnlySuspense>
    );
  },

  ...RapidDoubleColumnLayoutMeta,
} as Rock<RapidDoubleColumnLayoutRockConfig>;
