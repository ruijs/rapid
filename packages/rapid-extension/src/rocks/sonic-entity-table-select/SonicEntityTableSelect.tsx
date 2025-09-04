import { EventEmitter, MoveStyleUtils, type Rock, type RockInstanceContext } from "@ruiapp/move-style";
import SonicEntityTableSelectMeta from "./SonicEntityTableSelectMeta";
import type { SonicEntityTableSelectRockConfig } from "./sonic-entity-table-select-types";
import { convertToEventHandlers, renderRock } from "@ruiapp/react-renderer";
import { Table, Select, Input, TableProps, Empty, Spin } from "antd";
import { debounce, filter, forEach, get, isArray, isFunction, isObject, isPlainObject, isString, isUndefined, last, map, omit, pick, set, split } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMergeState } from "../../hooks/use-merge-state";
import { getRapidApi } from "../../rapidApi";
import { FindEntityOptions, RapidEntity } from "../../rapid-types";
import { parseConfigToFilters } from "../../functions/searchParamsToFilters";
import rapidAppDefinition from "../../rapidAppDefinition";
import { EntityStore, EntityStoreConfig } from "../../stores/entity-store";
import dayjs from "dayjs";

import "../rapid-table-select/rapid-table-select-style.css";
import { getEntityPropertyByCode } from "../../helpers/metaHelper";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";
import { calculateColumnsTotalWidth, convertRapidTableColumnToAntdTableColumn } from "../rapid-table/RapidTable";

const bus = new EventEmitter();

interface ICurrentState {
  offset: number;
  keyword?: string;
  selectedRecordMap: Record<string, any>;
  visible?: boolean;
  reloadKey?: string | number;
}

export default {
  onReceiveMessage(message, state, props) {
    if (message.name === "refreshData") {
      bus.emit(`${props.$id}-refresh`, message.payload);
    } else if (message.name === "reload") {
      bus.emit(`${props.$id}-reload`);
    }
  },

  Renderer(context, props: SonicEntityTableSelectRockConfig) {
    const { framework, logger, page } = context;

    const entity = rapidAppDefinition.getEntityByCode(props.entityCode);
    const displayPropertyCode = entity.displayPropertyCode || "name";
    const displayProperty = getEntityPropertyByCode(rapidAppDefinition.getAppDefinition(), entity, displayPropertyCode);

    let defaultDisplayField = "name";
    let defaultDisplayTitle = getExtensionLocaleStringResource(framework, "name");
    if (displayProperty) {
      defaultDisplayField = displayProperty.code;
      defaultDisplayTitle = displayProperty.name;
    }

    const {
      listValueFieldName = "id",
      listTextFieldName = defaultDisplayField,
      listTextFormat,
      pageSize = 20,
      columns = [{ title: defaultDisplayTitle, code: defaultDisplayField, width: 120 }],
      listDataSourceCode,
      listFilterFields = [defaultDisplayField],
      filterDisabled,
      allowClear,
      disabled,
      placeholder,
      tableHeight = 400,
    } = props;

    let { dropdownMatchSelectWidth } = props;
    if (isUndefined(dropdownMatchSelectWidth)) {
      dropdownMatchSelectWidth = 360;
    }

    const isMultiple = props.mode === "multiple";

    const refreshDataRef = useRef<Function>(null);
    const [currentState, setCurrentState] = useMergeState<ICurrentState>({ offset: 0, selectedRecordMap: {} });
    const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
    const debouncedCallBack = useCallback(
      debounce((m) => setDebouncedKeyword(m), 600),
      [],
    );

    const apiIns = useRequest(context, props, entity);
    const { loadSelectedRecords, loading } = useSelectedRecords(props, (records) => {
      forEach(records, (record) => {
        const recordValue = get(record, listValueFieldName);
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

      if (currentState.keyword && listFilterFields?.length) {
        params.filters = [
          {
            operator: "or",
            filters: listFilterFields.map((field) => {
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

    refreshDataRef.current = loadData;
    useEffect(() => {
      const refreshHandler = () => {
        refreshDataRef.current?.();
      };

      bus.on(`${props.$id}-refresh`, refreshHandler);

      return () => {
        bus.off(`${props.$id}-refresh`, refreshHandler);
      };
    }, [props.$id]);

    useEffect(() => {
      const reloadHandler = () => {
        setCurrentState({ offset: 0, reloadKey: dayjs().unix() });
      };

      bus.on(`${props.$id}-reload`, reloadHandler);

      return () => {
        bus.off(`${props.$id}-reload`, reloadHandler);
      };
    }, [props.$id, setCurrentState]);

    useEffect(() => {
      loadData();
    }, [props.entityCode, currentState.offset, currentState.reloadKey, debouncedKeyword]);

    const getLabel = (record: Record<string, any>) => {
      if (props.labelRendererType) {
        return renderRock({
          context,
          rockConfig: {
            $type: props.labelRendererType,
            ...props.labelRendererProps,
            value: record,
          },
        });
      }

      if (!listTextFormat) {
        return get(record, listTextFieldName);
      }

      return MoveStyleUtils.fulfillVariablesInString(listTextFormat, record);
    };

    const selectedKeys = useMemo(() => {
      let val: any | any[] = props.value != null ? props.value : [];
      if (!isArray(val)) {
        val = val !== "" ? [val] : [];
      }

      return val.map((item) => {
        if (isPlainObject(item)) {
          const lastCode = last(split(listValueFieldName, "."));

          return get(item, listValueFieldName) || get(item, lastCode);
        }

        return item;
      });
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
          return record ? { label: getLabel(record), value: get(record, listValueFieldName) } : null;
        })
        .filter((record) => record != null);
    }, [currentState.selectedRecordMap]);

    const eventHandlers = convertToEventHandlers({ context, rockConfig: props }) as any;

    const tableColumns = map(columns, (column) =>
      convertRapidTableColumnToAntdTableColumn(logger, framework, context, {
        $type: "rapidTableColumn",
        ...column,
      }),
    );
    const columnsTotalWidth = calculateColumnsTotalWidth(columns);

    const current = isMultiple ? selectedKeys : selectedKeys[0];

    const onSelectRows = (records: any[]) => {
      let keys = selectedKeys || [];
      let s = { ...currentState, selectedRecordMap: { ...currentState.selectedRecordMap } };

      forEach(records, (record) => {
        const recordValue = get(record, listValueFieldName);

        const isExisted = keys.some((k) => k === recordValue);

        if (isExisted) {
          keys = keys.filter((k) => k !== recordValue);
        } else {
          keys = [recordValue, ...keys];
        }

        s.selectedRecordMap[recordValue] = record;
        if (isExisted) {
          s.selectedRecordMap = omit(s.selectedRecordMap, recordValue);
        }
      });

      if (!isMultiple) {
        s.visible = false;
      }

      setCurrentState(s);

      eventHandlers.onChange?.(isMultiple ? keys : keys[0]);

      const selectedRecords = keys.map((k) => s.selectedRecordMap[k]);
      const validRecords = filter(records, (record) => s.selectedRecordMap[get(record, listValueFieldName)] != null);

      eventHandlers.onSelectedRecord?.(isMultiple ? validRecords : validRecords[0], selectedRecords, s);
    };

    const data = context.scope.getStore(listDataSourceCode)?.data;

    return (
      <Select
        allowClear={allowClear}
        disabled={disabled}
        bordered={props.bordered}
        loading={apiIns.loading || loading}
        placeholder={placeholder || getExtensionLocaleStringResource(framework, "pleaseSelect")}
        value={current}
        mode={isMultiple ? "multiple" : undefined}
        open={currentState.visible}
        onChange={(v) => {
          const arrs = isArray(v) ? v : v != null ? [v] : [];
          const selectedRecords = arrs?.map((k) => currentState.selectedRecordMap[k]);

          eventHandlers.onChange?.(v);
          eventHandlers.onSelectedRecord?.(null, selectedRecords, pick(currentState.selectedRecordMap, arrs));
        }}
        onDropdownVisibleChange={(v) => {
          setCurrentState({ visible: v });
        }}
        options={selectOptions}
        dropdownStyle={{ padding: 0 }}
        dropdownMatchSelectWidth={dropdownMatchSelectWidth}
        dropdownRender={(menu) => {
          return (
            <>
              {!filterDisabled && listFilterFields?.length ? (
                <div className="pm-table-selector--toolbar">
                  <Input
                    allowClear
                    placeholder={props.searchPlaceholder || getExtensionLocaleStringResource(framework, "search")}
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
                {!data?.list?.length ? (
                  <Empty style={{ margin: "24px 0" }} />
                ) : (
                  <Table
                    size="small"
                    rowKey={(record) => get(record, listValueFieldName)}
                    scroll={{ x: columnsTotalWidth, y: tableHeight }}
                    columns={tableColumns}
                    dataSource={data.list || []}
                    rowClassName="pm-table-row"
                    rowSelection={{
                      fixed: true,
                      type: isMultiple ? "checkbox" : "radio",
                      selectedRowKeys: selectedKeys,
                      onSelectAll(selected, selectedRows, changeRows) {
                        onSelectRows(changeRows || []);
                      },
                      onSelect(record) {
                        onSelectRows([record]);
                      },
                    }}
                    onRow={(record) => {
                      return {
                        onClick: () => {
                          onSelectRows([record]);
                        },
                      };
                    }}
                    pagination={{
                      size: "small",
                      current: currentState.offset / pageSize + 1,
                      pageSize,
                      total: data?.total || 0,
                      hideOnSinglePage: true,
                      showSizeChanger: false,
                      onChange(page) {
                        setCurrentState({ offset: (page - 1) * pageSize });
                      },
                    }}
                  />
                )}
              </Spin>
            </>
          );
        }}
      />
    );
  },

  ...SonicEntityTableSelectMeta,
} as Rock;

interface IRequestState {
  loading?: boolean;
}

function useRequest(context: RockInstanceContext, props: SonicEntityTableSelectRockConfig, entity: RapidEntity) {
  const [state, setState] = useMergeState<IRequestState>({});

  useEffect(() => {
    const listDataSourceCode = props.listDataSourceCode;
    const store = context.scope.getStore(listDataSourceCode);
    if (store) {
      return;
    }

    const entity = rapidAppDefinition.getEntityByCode(props.entityCode);

    let { requestParams = {} } = props;

    const listDataStoreConfig: EntityStoreConfig = {
      type: "entityStore",
      name: listDataSourceCode,
      entityModel: entity,
      fixedFilters: requestParams.fixedFilters,
      filters: requestParams.filters,
      properties: requestParams.properties || [],
      orderBy: requestParams.orderBy ||
        entity.defaultOrderBy || [
          {
            field: "id",
          },
        ],
      pagination: requestParams.pagination || { limit: props.pageSize || 20, offset: 0 },
      keepNonPropertyFields: requestParams.keepNonPropertyFields,
      $exps: requestParams.$exps,
    };

    context.scope.addStore(listDataStoreConfig);
  }, []);

  const request = async (params: any) => {
    if (state.loading) {
      return;
    }

    let configParams = props.requestParams || {};
    const expressions = configParams.$exps;
    if (expressions) {
      for (const propName in expressions) {
        const interpretedValue = context.page.interpreteExpression(expressions[propName], {
          $scope: context.scope,
          $page: context.page,
        });

        set(configParams, propName, interpretedValue);
      }
    }

    setState({ loading: true });
    try {
      const store: EntityStore = context.scope.getStore(props.listDataSourceCode);

      store.updateConfig({
        fixedFilters: configParams.fixedFilters,
      });

      await context.scope.loadStoreData(props.listDataSourceCode, {
        ...omit(configParams, "fixedFilters"),
        ...params,
      });
    } finally {
      setState({ loading: false });
    }
  };

  return { request, ...state };
}

function useSelectedRecords(props: SonicEntityTableSelectRockConfig, onSuccess: (records: any[]) => void) {
  const { requestParams, listValueFieldName = "id" } = props;
  const rapidApi = getRapidApi();
  const [loading, setLoading] = useState<boolean>(false);

  const loadSelectedRecords = async (keys: string[]) => {
    if (!keys?.length) {
      return;
    }

    const entity = rapidAppDefinition.getEntityByCode(props.entityCode);

    setLoading(true);

    const filterCodes = split(listValueFieldName, ".");

    rapidApi
      .post(`/${entity.namespace}/${entity.pluralCode}/operations/find`, {
        ...pick(requestParams || {}, "properties"),
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
