import type { Rock } from "@ruiapp/move-style";
import { get, set } from "lodash";
import { Checkbox, Popover, Tree } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { RapidEntityListConfig } from "../rapid-entity-list/rapid-entity-list-types";

import "./style.css";

interface IProps {
  columns: RapidEntityListConfig["columns"];
}

export default {
  $type: "rapidEntityListShowOrHideColumnSettings",

  slots: {},

  propertyPanels: [],

  Renderer(context, props: IProps) {
    const { columns } = props;

    console.log(111212555, columns);
    const { fixedLeftColumns, fixedRightColumns, commonColumns } = useMemo(() => {
      let fixedLeftColumns: IProps["columns"] = [];
      let fixedRightColumns: IProps["columns"] = [];
      let commonColumns: IProps["columns"] = [];

      columns?.forEach((col) => {
        switch (col.fixed) {
          case "left":
            fixedLeftColumns.push(col);
            break;
          case "right":
            fixedRightColumns.push(col);
            break;
          default:
            commonColumns.push(col);
            break;
        }
      });

      return { fixedLeftColumns, fixedRightColumns, commonColumns };
    }, [columns]);

    const onFixedLeftCheck = (checkedKeys: string[]) => {};

    const onFixedRightCheck = (checkedKeys: string[]) => {};

    const onTreeCheck = (checkedKeys: string[]) => {};

    const onTreeDrop = ({ node, dragNode }) => {
      console.log(1244555, node, dragNode);
    };

    return (
      <Popover
        showArrow={false}
        content={
          <div className="sonic-entity-list-rapidEntityListShowOrHideColumnSettings">
            {fixedLeftColumns.length > 0 && (
              <>
                <div className="sonic-entity-list-rapidEntityListShowOrHideColumnSettings--title">固定在左侧</div>
                <Checkbox.Group style={{ width: "100%" }} value={[]} onChange={onFixedLeftCheck}>
                  {fixedLeftColumns.map((col) => (
                    <div key={col.code}>
                      <Checkbox value={col.code}>{col.title}</Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              </>
            )}
            <div className="sonic-entity-list-rapidEntityListShowOrHideColumnSettings--title">不固定</div>
            <Tree draggable blockNode selectable={false} checkable checkedKeys={[]} onCheck={onTreeCheck} onDrop={onTreeDrop}>
              {commonColumns.map((col) => (
                <Tree.TreeNode key={col.code} title={col.title} />
              ))}
            </Tree>
            {fixedRightColumns.length > 0 && (
              <>
                <div className="sonic-entity-list-rapidEntityListShowOrHideColumnSettings--title">固定在右侧</div>
                <Checkbox.Group style={{ width: "100%" }} value={[]} onChange={onFixedRightCheck}>
                  {fixedRightColumns.map((col) => (
                    <div key={col.code}>
                      <Checkbox value={col.code}>{col.title}</Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              </>
            )}
          </div>
        }
      >
        <span style={{ fontSize: 16 }}>
          <SettingOutlined />
        </span>
      </Popover>
    );
  },
} as Rock;
