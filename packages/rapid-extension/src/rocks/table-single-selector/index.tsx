import type { Rock } from "@ruiapp/move-style";
import TableSingleSelectorMeta from "./meta";
import type { TableSingleSelectorRockConfig } from "./type";
import { convertToEventHandlers } from "@ruiapp/react-renderer";
import { Table, Select, Input, TableProps, Empty, Spin } from "antd";
import { get, isFunction, isString } from "lodash";
import { useEffect } from "react";
import { useMergeState } from "../../hooks/use-merge-state";
const Search = Input.Search;

import "./style.css";
import rapidApi from "../../rapidApi";

interface ICurrentState {
  offset: number;
  keyword?: string;
  selectedRecord?: any;
  visible?: boolean;
}

export default {
  Renderer(context, props: TableSingleSelectorRockConfig) {
    const {
      valueKey = "id",
      labelKey = "name",
      dropdownMatchSelectWidth = 360,
      labelFormat,
      value,
      pageSize = 20,
      columns,
      searchFields,
      allowClear,
      placeholder,
    } = props;

    const [currentState, setCurrentState] = useMergeState<ICurrentState>({ offset: 0 });

    const apiIns = useRequest(props.requestConfig);

    const loadData = () => {
      const params: any = {
        filters: [],
        pagination: {
          limit: pageSize,
          offset: currentState.offset,
        },
      };

      if (currentState.keyword && searchFields?.length) {
        params.filters = [
          {
            operator: "or",
            filters: searchFields.map((field) => ({ field, operator: "contains", value: currentState.keyword })),
          },
        ];
      }

      apiIns.request(params);
    };

    useEffect(() => {
      loadData();
    }, [props.requestConfig?.url]);

    const eventHandlers = convertToEventHandlers({ context, rockConfig: props }) as any;

    let tableColumns: TableProps<any>["columns"] = [];
    let tableWidth = 0;
    (columns || []).forEach((col) => {
      tableWidth += col.width || 100;
      tableColumns.push({
        title: col.title,
        dataIndex: col.code,
        width: col.width,
        render: (text: any, record: any) => {
          if (isFunction(col.render)) {
            return col.render(record);
          }

          if (isString(col.render)) {
            return context.page.interpreteExpression(col.render, {
              record,
              $scope: context.scope,
            });
          }

          return col.format ? replaceLabel(col.format, record) : get(record, col.code);
        },
      });
    });

    const getLabel = (record: Record<string, any>) => {
      if (!labelFormat) {
        return get(record, labelKey);
      }

      return replaceLabel(labelFormat, record);
    };

    return (
      <Select
        allowClear={allowClear}
        placeholder={placeholder}
        value={value}
        open={currentState.visible}
        onChange={() => {
          eventHandlers.onChange?.(undefined);
          eventHandlers.onSelectedRecord?.(undefined);
        }}
        onDropdownVisibleChange={(v) => {
          setCurrentState({ visible: v });
        }}
        options={currentState.selectedRecord ? [{ label: getLabel(currentState.selectedRecord), value: get(currentState.selectedRecord, valueKey) }] : []}
        dropdownMatchSelectWidth={dropdownMatchSelectWidth}
        dropdownRender={(menu) => {
          return (
            <div className="pm-table-single-selector">
              {searchFields?.length ? (
                <div className="pm-table-single-selector--toolbar">
                  <Search
                    enterButton
                    allowClear
                    placeholder={props.searchPlaceholder}
                    loading={apiIns.loading}
                    value={currentState.keyword}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCurrentState({ keyword: v, offset: 0 });
                    }}
                    onSearch={() => {
                      loadData();
                    }}
                  />
                </div>
              ) : null}
              <Spin spinning={apiIns.loading || false}>
                {!apiIns.records?.length ? (
                  <Empty style={{ margin: "24px 0" }} />
                ) : (
                  <Table
                    size="small"
                    rowKey="id"
                    scroll={{ x: tableWidth, y: 200 }}
                    columns={tableColumns}
                    dataSource={apiIns.records || []}
                    rowClassName={(record) => (get(record, valueKey) === value ? "pm-table-row-pointer--selected" : `pm-table-row-pointer`)}
                    onRow={(record) => {
                      return {
                        onClick: () => {
                          setCurrentState({ selectedRecord: record, visible: false });
                          eventHandlers.onChange?.(get(record, valueKey));
                          eventHandlers.onSelectedRecord?.(record);
                        },
                      };
                    }}
                    pagination={{
                      size: "small",
                      current: currentState.offset / pageSize + 1,
                      pageSize,
                      total: apiIns.total || 0,
                      hideOnSinglePage: true,
                      showSizeChanger: false,
                      onChange(page) {
                        setCurrentState({ offset: (page - 1) * pageSize });
                      },
                    }}
                  />
                )}
              </Spin>
            </div>
          );
        }}
      />
    );
  },

  ...TableSingleSelectorMeta,
} as Rock;

interface IRequestState {
  loading?: boolean;
  records?: any[];
  page?: number;
  total?: number;
}

function useRequest(config: TableSingleSelectorRockConfig["requestConfig"]) {
  const [state, setState] = useMergeState<IRequestState>({});

  const request = async (params: any) => {
    if (!config?.url) {
      return;
    }

    if (state.loading) {
      return;
    }

    setState({ loading: true });
    rapidApi[config.method || "post"](`${config.baseUrl || ""}${config.url || ""}`, {
      ...(config.params || {}),
      ...params,
      filters: [...(config.params?.fixedFilters || []), ...params.filters],
    })
      .then((res) => {
        let records = res.data?.list || [];
        let total = res.data?.total || 0;
        if (res.status < 200 || res.status >= 400) {
          setState({ loading: false });
        } else {
          setState({ loading: false, records, total });
        }
      })
      .catch((e) => {
        setState({ loading: false });
      });
  };

  return { request, ...state };
}

function replaceLabel(formatTpl: string, record: Record<string, any>) {
  return formatTpl.replace(/\{\{(\S+?)\}\}/g, (match, key) => {
    return get(record, key) || "";
  });
}
