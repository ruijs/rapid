import { MoveStyleUtils, Rock, handleComponentEvent } from "@ruiapp/move-style";
import { toRenderRockSlot, convertToEventHandlers, convertToSlotProps, renderRock } from "@ruiapp/react-renderer";
import { Table, TableProps } from "antd";
import { ColumnType } from "antd/lib/table/interface";
import { filter, get, map, merge, omit, reduce, trim } from "lodash";
import RapidTableMeta from "./RapidTableMeta";
import { RapidTableRockConfig } from "./rapid-table-types";
import { parseRockExpressionFunc } from "../../utils/parse-utility";
import { memo } from "react";
import VirtualTable from "./VirtualTable";

const ExpandedRowComponent = memo<Record<string, any>>((props) => {
  const { expandedRow, record, index, context } = props;

  const page = context.page;
  const slotProps = { record, index };

  if (expandedRow.$exps) {
    page.interpreteComponentProperties(null, expandedRow, { $slot: slotProps });
  }

  return renderRock({
    context,
    rockConfig: {
      $id: `${record.id}_expandedRow`,
      ...expandedRow,
    },
    expVars: {
      $slot: slotProps,
    },
    fixedProps: {
      $slot: slotProps,
    },
  }) as any;
});

export default {
  Renderer(context, props: RapidTableRockConfig) {
    const { framework, logger, page, scope } = context;
    const tableColumns = map(
      filter(props.columns, (column) => !column._hidden),
      (column) => {
        MoveStyleUtils.localizeConfigProps(framework, logger.getInternalLogger(), column);

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
        topParentValue: props.treeTopParentValue,
      } as any);
    } else if (typeof props.dataSourceAdapter === "string" && trim(props.dataSourceAdapter)) {
      const adapter = parseRockExpressionFunc(props.dataSourceAdapter, { data: dataSource }, context);
      dataSource = adapter();
    }

    let expandable: any = null;
    if (props.expandedRow) {
      expandable = {
        expandedRowRender: (record, index) => {
          const expandedRow = { ...props.expandedRow };

          let recordKey: string;

          let rowKey: any = props.rowKey || "id";
          if (typeof rowKey === "function") {
            recordKey = rowKey(record, index);
          } else {
            recordKey = get(record, rowKey);
          }

          return <ExpandedRowComponent key={recordKey} expandedRow={expandedRow} record={record} index={index} context={context} />;
        },
      };
    }

    const antdProps: TableProps<any> = {
      ...omit(merge({ expandable }, MoveStyleUtils.omitSystemRockConfigFields(props)), "expandedRow"),
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
        y: props.height,
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

    if (props.virtual) {
      return <VirtualTable {...antdProps} onRow={onRow} />;
    }

    return <Table {...antdProps} onRow={onRow}></Table>;
  },

  ...RapidTableMeta,
} as Rock;
