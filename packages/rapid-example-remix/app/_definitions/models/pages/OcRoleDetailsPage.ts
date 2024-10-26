import type { RapidCheckboxListFormInputConfig, RapidPage } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "oc_role_details",
  name: "角色详情",
  title: "角色详情",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "rapidEntityDescriptions",
      entityCode: "OcRole",
      mode: "view",
      column: 2,
      extraProperties: ["actions"],
      items: [
        {
          type: "auto",
          code: "name",
        },
        {
          type: "auto",
          code: "state",
        },
        {
          type: "auto",
          code: "createdBy",
        },
        {
          type: "auto",
          code: "createdAt",
        },
        {
          type: "auto",
          code: "description",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    },
    {
      $type: "antdTabs",
      items: [
        {
          key: "actions",
          label: "权限",
          children: [
            {
              $type: "rapidEntityForm",
              dataSourceCode: "detail",
              entityCode: "OcRole",
              layout: "vertical",
              items: [
                {
                  type: "auto",
                  code: "actions",
                  label: null,
                  formControlType: "rapidCheckboxListFormInput",
                  formControlProps: {
                    listDataSourceCode: "sysActions",
                    listTextFieldName: "name",
                    groupsDataSourceCode: "sysActionGroups",
                    groupByFieldName: "group.id",
                  } satisfies RapidCheckboxListFormInputConfig,
                },
              ],
              actions: [
                {
                  actionType: "submit",
                  actionText: "保存",
                },
              ],
              $exps: {
                entityId: `$rui.parseQuery().id`,
              },
            },
          ],
        },
        {
          key: "users",
          label: "用户",
          children: [
            {
              $id: "userList",
              $type: "sonicEntityList",
              entityCode: "OcUser",
              viewMode: "table",
              fixedFilters: [
                {
                  field: "roles",
                  operator: "exists",
                  filters: [
                    {
                      field: "id",
                      operator: "eq",
                      value: "",
                    },
                  ],
                },
              ],
              listActions: [
                {
                  $type: "sonicToolbarSelectEntityButton",
                  text: "添加",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                  entityCode: "OcUser",
                  quickSearchFields: ["name", "login"],
                  columns: [
                    {
                      type: "auto",
                      code: "name",
                    },
                    {
                      type: "auto",
                      code: "login",
                    },
                  ],
                  onSelected: [
                    {
                      $action: "sendHttpRequest",
                      method: "POST",
                      url: "/api/app/oc_roles/operations/add_relations",
                      data: {
                        property: "users",
                      },
                      $exps: {
                        "data.id": "$rui.parseQuery().id",
                        "data.relations": "_.map($event.args[0].selectedIds, function(id) {return {id: id}})",
                      },
                    },
                    {
                      $action: "loadStoreData",
                      scopeId: "userList-scope",
                      storeName: "list",
                    },
                  ],
                },
                {
                  $type: "sonicToolbarRefreshButton",
                  text: "刷新",
                  icon: "ReloadOutlined",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "name",
                  fixed: "left",
                },
                {
                  type: "auto",
                  code: "login",
                  fixed: "left",
                },
                {
                  type: "auto",
                  code: "department",
                  fieldName: "department.name",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "roles",
                  width: "250px",
                  rendererProps: {
                    item: {
                      $type: "rapidLinkRenderer",
                      url: "/pages/oc_role_details?id={{id}}",
                      text: "{{name}}",
                    },
                  },
                },
                {
                  type: "auto",
                  code: "state",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "createdAt",
                  width: "150px",
                },
              ],
              actions: [
                {
                  $type: "rapidTableAction",
                  code: "remove",
                  actionText: "移除",
                  confirmText: "您确定要从角色中移除此用户吗？",
                  onAction: [
                    {
                      $action: "sendHttpRequest",
                      method: "POST",
                      url: "/api/app/oc_roles/operations/remove_relations",
                      data: {
                        property: "users",
                      },
                      $exps: {
                        "data.id": "$rui.parseQuery().id",
                        "data.relations": "[{id: $event.args[0].recordId}]",
                      },
                    },
                    {
                      $action: "loadStoreData",
                      storeName: "list",
                    },
                  ],
                },
              ],
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
  ],
  stores: [
    {
      type: "entityStore",
      name: "sysActionGroups",
      entityCode: "SysActionGroup",
      properties: ["id", "code", "name", "orderNum"],
      filters: [],
      orderBy: [
        {
          field: "orderNum",
        },
      ],
    },
    {
      type: "entityStore",
      name: "sysActions",
      entityCode: "SysAction",
      properties: ["id", "code", "name", "group", "orderNum"],
      filters: [],
      orderBy: [
        {
          field: "group_id",
        },
        {
          field: "orderNum",
        },
      ],
    },
  ],
};

export default page;
