import type { Rock } from "@ruiapp/move-style";
import TableSelectorMeta from "./TableSelectorMeta";
import type { TableSelectorRockConfig } from "./table-selector-types";
import { convertToEventHandlers } from "@ruiapp/react-renderer";
import { Table, Select, Input, TableProps, Empty, Spin } from "antd";
import { debounce, forEach, get, isArray, isFunction, isObject, isString, omit, pick, split } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMergeState } from "../../hooks/use-merge-state";
import rapidApi from "../../rapidApi";
import { FindEntityOptions } from "../../rapid-types";

import "./table-selector-style.css";
import { parseConfigToFilters } from "../../functions/searchParamsToFilters";

const DEFAULT_COLUMNS: TableSelectorRockConfig["columns"] = [{ title: "名称", code: "name", width: 120 }];

interface ICurrentState {
  offset: number;
  keyword?: string;
  selectedRecordMap: Record<string, any>;
  visible?: boolean;
}

export default {
  Renderer(context, props: TableSelectorRockConfig) {
    const {
      valueKey = "id",
      labelKey = "name",
      dropdownMatchSelectWidth = 360,
      labelFormat,
      pageSize = 20,
      columns = DEFAULT_COLUMNS,
      searchFields = ["name"],
      allowClear,
      placeholder,
    } = props;

    const [currentState, setCurrentState] = useMergeState<ICurrentState>({ offset: 0, selectedRecordMap: {} });
    const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
    const debouncedCallBack = useCallback(
      debounce((m) => setDebouncedKeyword(m), 600),
      [],
    );

    const apiIns = useRequest(props.requestConfig);
    const { loadSelectedRecords, loading } = useSelectedRecords(props, (records) => {
      forEach(records, (record) => {
        const recordValue = get(record, valueKey);
        setCurrentState((draft) => {
          return { ...draft, selectedRecordMap: { ...draft.selectedRecordMap, [recordValue]: record } };
        });
      });
    });

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
            filters: searchFields.map((field) => {
              if (isString(field)) {
                const filterCodes = split(field, ".");
                return parseSelectedRecordFilters(filterCodes, "contains", currentState.keyword)[0];
              } else if (isObject(field)) {
                return parseConfigToFilters([field], currentState.keyword)[0];
              }
            }),
          },
        ];
      }

      apiIns.request(params);
    };

    useEffect(() => {
      loadData();
    }, [props.requestConfig?.url, currentState.offset, debouncedKeyword]);

    const getLabel = (record: Record<string, any>) => {
      if (!labelFormat) {
        return get(record, labelKey);
      }

      return replaceLabel(labelFormat, record);
    };

    const selectedKeys = useMemo(() => {
      let val: string | string[] = props.value != null ? props.value : [];
      if (!isArray(val)) {
        val = val !== "" ? [val] : [];
      }

      return val;
    }, [props.value]);

    useEffect(() => {
      const keys = (selectedKeys || []).filter((key) => !currentState.selectedRecordMap[key]);
      if (keys.length) {
        loadSelectedRecords(keys);
      }
    }, [selectedKeys, currentState.selectedRecordMap]);

    const selectOptions = useMemo(() => {
      return Object.keys(currentState.selectedRecordMap)
        .map((k) => {
          const record = currentState.selectedRecordMap[k];
          return record ? { label: getLabel(record), value: get(record, valueKey) } : null;
        })
        .filter((record) => record != null);
    }, [currentState.selectedRecordMap]);

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

    const current = props.multiple ? selectedKeys : selectedKeys[0];

    const onSelect = (record: any) => {
      const recordValue = get(record, valueKey);

      const isExisted = selectedKeys?.some((k) => k === recordValue);

      let keys = selectedKeys;
      if (isExisted) {
        keys = selectedKeys.filter((k) => k !== recordValue);
      } else {
        keys = [recordValue, ...selectedKeys];
      }

      let s = { ...currentState, selectedRecordMap: { ...currentState.selectedRecordMap, [recordValue]: record } };
      if (isExisted) {
        s.selectedRecordMap = omit(s.selectedRecordMap, recordValue);
      }

      if (!props.multiple) {
        s.visible = false;
      }

      setCurrentState(s);

      eventHandlers.onChange?.(props.multiple ? keys : keys[0]);
      eventHandlers.onSelectedRecord?.(isExisted ? null : record, s);
    };

    return (
      <Select
        allowClear={allowClear}
        loading={apiIns.loading || loading}
        placeholder={placeholder || "请选择"}
        value={current}
        open={currentState.visible}
        onChange={() => {
          eventHandlers.onChange?.(undefined);
          eventHandlers.onSelectedRecord?.(undefined, {});
        }}
        onDropdownVisibleChange={(v) => {
          setCurrentState({ visible: v });
        }}
        options={selectOptions}
        dropdownStyle={{ padding: 0 }}
        dropdownMatchSelectWidth={dropdownMatchSelectWidth}
        dropdownRender={(menu) => {
          return (
            <div>
              {searchFields?.length ? (
                <div className="pm-table-selector--toolbar">
                  <Input
                    allowClear
                    placeholder={props.searchPlaceholder || "搜索"}
                    value={currentState.keyword}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCurrentState({ keyword: v, offset: 0 });
                      debouncedCallBack(v);
                    }}
                  />
                </div>
              ) : null}
              <Spin spinning={apiIns.loading || loading || false}>
                {!apiIns.records?.length ? (
                  <Empty style={{ margin: "24px 0" }} />
                ) : (
                  <Table
                    size="small"
                    rowKey={(record) => get(record, valueKey)}
                    scroll={{ x: tableWidth, y: 200 }}
                    columns={tableColumns}
                    dataSource={apiIns.records || []}
                    rowClassName="pm-table-row"
                    rowSelection={{
                      fixed: true,
                      type: props.multiple ? "checkbox" : "radio",
                      selectedRowKeys: selectedKeys,
                      onSelect(record) {
                        onSelect(record);
                      },
                    }}
                    onRow={(record) => {
                      return {
                        onClick: () => {
                          onSelect(record);
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

  ...TableSelectorMeta,
} as Rock;

interface IRequestState {
  loading?: boolean;
  records?: any[];
  page?: number;
  total?: number;
}

function useRequest(config: TableSelectorRockConfig["requestConfig"]) {
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
      ...omit(config.params || {}, "fixedFilters"),
      ...params,
      filters: [...(config.params?.fixedFilters || []), ...params.filters],
    })
      .then((res) => {
        let records = res.data?.list || [];
        let total = res.data?.total || 0;
        if (res.status < 200 || res.status >= 300) {
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

function useSelectedRecords(props: TableSelectorRockConfig, onSuccess: (records: any[]) => void) {
  const { requestConfig: config, valueKey } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const loadSelectedRecords = async (keys: string[]) => {
    if (!keys?.length) {
      return;
    }

    setLoading(true);

    const filterCodes = split(valueKey, ".");

    rapidApi[config.method || "post"](`${config.baseUrl || ""}${config.url || ""}`, {
      ...pick(config.params || {}, "properties"),
      pagination: {
        limit: 100,
        offset: 0,
      },
      filters: parseSelectedRecordFilters(filterCodes, "in", keys),
    })
      .then((res) => {
        let records = res.data?.list || [];
        if (res.status >= 200 && res.status < 300) {
          onSuccess(records);
          setLoading(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { loading, loadSelectedRecords };
}

function parseSelectedRecordFilters(codes: string[], operator: FindEntityOptions["filters"][0]["operator"], value: any): FindEntityOptions["filters"] {
  const [currentCode, ...restCodes] = codes || [];
  if (restCodes.length) {
    const nextFilters = parseSelectedRecordFilters(restCodes, operator, value);
    return [
      {
        field: currentCode,
        operator: "exists",
        filters: nextFilters || [],
      },
    ];
  } else if (currentCode) {
    return [
      {
        field: currentCode,
        operator: operator as any,
        value: value,
      },
    ];
  } else {
    return [];
  }
}

function replaceLabel(formatTpl: string, record: Record<string, any>) {
  return formatTpl.replace(/\{\{(\S+?)\}\}/g, (match, key) => {
    return get(record, key) || "";
  });
}
