import React, { useEffect, useRef, useState } from "react";
import { Table } from "antd";
import type { TableProps } from "antd";
import ResizeObserver from "rc-resize-observer";

import { VariableSizeGrid as Grid } from "react-window";
import { isPlainObject, isString, reduce } from "lodash";

import "./rapid-table-style.css";

const VirtualTable = <RecordType extends object>(props: TableProps<RecordType> & { rowHeight?: number }) => {
  const { columns, scroll, rowHeight = 54 } = props;
  const [tableWidth, setTableWidth] = useState(0);

  const tableBodyHeight = scroll?.y;

  const widthColumnCount = columns!.filter(({ width }) => !width).length;
  const mergedColumns = columns!.map((column) => {
    if (column.width) {
      return column;
    }

    return {
      ...column,
      width: Math.floor(tableWidth / widthColumnCount),
    };
  });

  const gridRef = useRef<any>();
  const [connectObject] = useState<any>(() => {
    const obj = {};
    Object.defineProperty(obj, "scrollLeft", {
      get: () => {
        if (gridRef.current) {
          return gridRef.current?.state?.scrollLeft;
        }
        return null;
      },
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });

    return obj;
  });

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: true,
    });
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const renderVirtualList = (rawData: object[], { scrollbarSize, ref, onScroll }: any) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * rowHeight;

    return (
      <Grid
        ref={gridRef}
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={(index: number) => {
          const { width } = mergedColumns[index];
          return (totalHeight as number) > (tableBodyHeight as number)! && index === mergedColumns.length - 1
            ? (width as number) - scrollbarSize - 1
            : (width as number);
        }}
        height={tableBodyHeight}
        rowCount={rawData.length}
        rowHeight={() => rowHeight}
        width={tableWidth}
        onScroll={({ scrollLeft }: { scrollLeft: number }) => {
          onScroll({ scrollLeft });
        }}
      >
        {({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
          let content = (rawData[rowIndex] as any)[(mergedColumns as any)[columnIndex].dataIndex];
          if (typeof (mergedColumns as any)[columnIndex].render === "function") {
            content = (mergedColumns as any)[columnIndex].render(content, rawData[rowIndex], rowIndex);
          }

          return (
            <div
              className={mergeClassNames("virtual-table-cell", {
                "virtual-table-cell-last": columnIndex === mergedColumns.length - 1,
              })}
              style={style}
            >
              {content}
            </div>
          );
        }}
      </Grid>
    );
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth(width);
      }}
    >
      <Table
        {...props}
        className="virtual-table"
        columns={mergedColumns}
        // pagination={false}
        components={{
          body: renderVirtualList,
        }}
      />
    </ResizeObserver>
  );
};

export default VirtualTable;

function mergeClassNames(...args: (string | Record<string, boolean>)[]) {
  return args
    .map((item) => {
      if (isString(item)) {
        return item;
      } else if (isPlainObject(item)) {
        return reduce(
          Object.keys(item),
          (sumStr, k) => {
            const v = item[k] ? k : "";
            if (v) {
              sumStr = sumStr ? `${sumStr} ${v}` : sumStr;
            }

            return sumStr;
          },
          "",
        );
      } else {
        return item?.toString();
      }
    })
    .filter((str) => !!str)
    .join(" ");
}
