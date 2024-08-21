import { MoveStyleUtils, Rock, handleComponentEvent } from "@ruiapp/move-style";
import { toRenderRockSlot, convertToEventHandlers, convertToSlotProps, renderRock } from "@ruiapp/react-renderer";
import { Table, TableProps } from "antd";
import { ColumnType } from "antd/lib/table/interface";
import { filter, map, reduce, trim } from "lodash";
import RapidTableMeta from "./RapidTableMeta";
import { RapidTableRockConfig } from "./rapid-table-types";
import { parseRockExpressionFunc } from "../../utils/parse-utility";

export default {
  Renderer(context, props: RapidTableRockConfig) {
    const { framework, page, scope } = context;
    const tableColumns = map(
      filter(props.columns, (column) => !column._hidden),
      (column) => {
        return {
          ...MoveStyleUtils.omitSystemRockConfigFields(column),
          dataIndex: (column.fieldName || column.code).split("."),
          key: column.key || column.fieldName || column.code,
          render: toRenderRockSlot({ context, slot: column.cell, rockType: column.$type, slotPropName: "cell" }),
        } as ColumnType<any>;
      },
    );

    // calculate total width of columns
    const columnsTotalWidth = reduce(
      props.columns,
      (accumulatedWidth, column) => {
        return accumulatedWidth + (parseInt(column.width, 10) || parseInt(column.minWidth, 10) || 100);
      },
      0,
    );

    const eventHandlers = convertToEventHandlers({ context, rockConfig: props });
    const slotProps = convertToSlotProps({ context, rockConfig: props, slotsMeta: RapidTableMeta.slots });

    let dataSource = props.dataSource;
    if (props.convertListToTree) {
      dataSource = MoveStyleUtils.listToTree(props.dataSource, {
        listIdField: props.listIdField,
        listParentField: props.listParentField,
        treeChildrenField: props.treeChildrenField,
      });
    } else if (typeof props.dataSourceAdapter === "string" && trim(props.dataSourceAdapter)) {
      const adapter = parseRockExpressionFunc(props.dataSourceAdapter, { data: dataSource }, context);
      dataSource = adapter();
    }

    let expandable: any = null;
    if (props.expandedRow) {
      expandable = {
        expandedRowRender: (record, index) => {
          const expandedRow = { ...props.expandedRow, record, recordIndex: index };

          if (expandedRow.$exps) {
            page.interpreteComponentProperties(null, expandedRow, {});
          }

          return renderRock({
            context,
            rockConfig: expandedRow,
          });
        },
      };
    }

    const antdProps: TableProps<any> = {
      ...MoveStyleUtils.omitSystemRockConfigFields(props),
      ...eventHandlers,
      ...slotProps,
      dataSource: dataSource,
      rowKey: props.rowKey || "id",
      pagination: props.pagination
        ? {
            showSizeChanger: false,
            ...props.pagination,
          }
        : props.pagination,
      columns: tableColumns,
      scroll: {
        x: columnsTotalWidth,
      },
    };

    const onRow: TableProps<any>["onRow"] = (record) => {
      return {
        onClick: (event) => {
          if (props.onRowClick) {
            handleComponentEvent("onRowClick", framework, page, scope, props, props.onRowClick, [{ record }]);
          }
        },
      };
    };

    return <Table {...antdProps} onRow={onRow}></Table>;
  },

  ...RapidTableMeta,
} as Rock;
