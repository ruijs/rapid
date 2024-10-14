import { get } from "lodash";
import { memo, useMemo } from "react";
import { DataEditor, GridCell, GridCellKind, SizedGridColumn } from "@glideapps/glide-data-grid";
import { TableProps } from "antd";

import "./style.css";

type IVirtualTableProps<T = any> = TableProps<T>;

const VirtualTable = memo<IVirtualTableProps>((props) => {
  const { dataSource, columns } = props;

  const rowCount = useMemo(() => (dataSource || []).length, [dataSource]);

  const getCellContent = ([colIdx, rowIdx]): GridCell => {
    const record = dataSource?.[rowIdx];
    const column: any = columns[colIdx];

    let text = get(record, column.dataIndex);
    if (typeof column.render === "function") {
      text = column.render(text, record, rowIdx);
    }

    if (typeof text === "string") {
      return {
        kind: GridCellKind.Text,
        data: text,
        allowOverlay: false,
        displayData: text,
      };
    } else {
      return {
        kind: GridCellKind.Custom,
        data: text,
        allowOverlay: false,
        copyData: "",
      };
    }
  };

  return (
    <DataEditor
      columns={columns.map<SizedGridColumn>((col) => ({ title: col.title as string, width: parseInt((col.width || 100) as any, 10) }))}
      getCellContent={getCellContent}
      rows={rowCount}
    />
  );
});

export default VirtualTable;
