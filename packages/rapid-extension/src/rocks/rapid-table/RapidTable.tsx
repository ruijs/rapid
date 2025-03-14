import { Framework, MoveStyleUtils, Rock, RockInstanceContext, RuiRockLogger, handleComponentEvent } from "@ruiapp/move-style";
import { toRenderRockSlot, convertToEventHandlers, convertToSlotProps, renderRock, renderRockSlot } from "@ruiapp/react-renderer";
import { Table, TableProps } from "antd";
import { ColumnType } from "antd/lib/table/interface";
import { filter, get, map, merge, omit, reduce, some, sum, trim } from "lodash";
import RapidTableMeta from "./RapidTableMeta";
import { RapidTableRockConfig } from "./rapid-table-types";
import { parseRockExpressionFunc } from "../../utils/parse-utility";
import { memo } from "react";
import VirtualTable from "./VirtualTable";
import { RapidTableColumnRockConfig } from "../rapid-table-column/rapid-table-column-types";

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

function getColumnDataIndex(column: RapidTableColumnRockConfig) {
  return (column.fieldName || column.code).split(".");
}

function convertRapidTableColumnToAntdTableColumn(
  logger: RuiRockLogger,
  framework: Framework,
  context: RockInstanceContext,
  column: RapidTableColumnRockConfig,
) {
  MoveStyleUtils.localizeConfigProps(framework, logger.getInternalLogger(), column);

  if (column.children) {
    return {
      ...MoveStyleUtils.omitSystemRockConfigFields(column),
      children: map(column.children, (childColumn) => convertRapidTableColumnToAntdTableColumn(logger, framework, context, childColumn)),
    };
  }

  return {
    ...MoveStyleUtils.omitSystemRockConfigFields(column),
    dataIndex: getColumnDataIndex(column),
    key: column.key || column.fieldName || column.code,
    render: toRenderRockSlot({ context, slot: column.cell, rockType: column.$type, slotPropName: "cell" }),
  } as ColumnType<any>;
}

export default {
  Renderer(context, props: RapidTableRockConfig) {
    const { framework, logger, page, scope } = context;

    const columns = filter(props.columns, (column) => !column._hidden);

    const tableColumns = map(columns, (column) => convertRapidTableColumnToAntdTableColumn(logger, framework, context, column));

    // calculate total width of columns
    const columnsTotalWidth = reduce(
      columns,
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

    let summaryRenderer: any;
    if (dataSource && dataSource.length && some(columns, (item) => !!item.summaryMethod)) {
      summaryRenderer = (records: any[]) => {
        return (
          <Table.Summary.Row>
            {columns.map((column, index) => {
              let summaryResult = "";
              if (column.summaryMethod === "sum") {
                summaryResult = sum(map(dataSource, (record) => get(record, getColumnDataIndex(column)))).toString();
              }

              let summaryCellContent = summaryResult;
              if (column.summaryRendererType) {
                summaryCellContent = renderRock({
                  context,
                  rockConfig: {
                    $id: `${props.$id}-summaryContent-${index}`,
                    $type: column.summaryRendererType,
                    ...column.summaryRendererProps,
                    value: summaryResult,
                  },
                });
              }
              return (
                <Table.Summary.Cell key={index} index={index}>
                  {summaryResult}
                </Table.Summary.Cell>
              );
            })}
          </Table.Summary.Row>
        );
      };
      antdProps.summary = summaryRenderer;
    }

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

    return <Table className="rapid-table" {...antdProps} onRow={onRow}></Table>;
  },

  ...RapidTableMeta,
} as Rock;
