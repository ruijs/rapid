import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormRockConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const actionFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "group",
      formControlProps: {
        listOrderBy: [
          {
            field: "orderNum",
          },
        ],
      },
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "code",
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "orderNum",
    },
  ],
};

const actionGroupFormConfig: Partial<RapidEntityFormRockConfig> = {
  items: [
    {
      type: "auto",
      code: "code",
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "orderNum",
    },
  ],
};

const page: RapidPage = {
  code: "sys_action_list",
  name: "系统操作",
  title: "系统操作",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicMainSecondaryLayout",
      $id: "dictionariesLayout",
      mainTitle: "权限项分组",
      mainColSpan: 8,
      secondaryTitle: "权限项",
      secondaryColSpan: 16,
      main: {
        $type: "sonicEntityList",
        entityCode: "SysActionGroup",
        viewMode: "table",
        selectionMode: "single",
        selectOnClickRow: true,
        fixedFilters: [],
        orderBy: [
          {
            field: "orderNum",
          },
        ],
        listActions: [
          {
            $type: "sonicToolbarNewEntityButton",
            text: "新建",
            icon: "PlusOutlined",
            actionStyle: "primary",
          },
          // {
          //   $type: "sonicToolbarRefreshButton",
          //   text: "刷新",
          //   icon: "ReloadOutlined",
          // },
        ],
        pageSize: -1,
        columns: [
          {
            type: "auto",
            code: "orderNum",
            width: "80px",
          },
          {
            type: "auto",
            code: "code",
            width: "100px",
          },
          {
            type: "auto",
            code: "name",
          },
        ],
        actions: [
          {
            $type: "sonicRecordActionEditEntity",
            code: "edit",
            actionType: "edit",
            actionText: "修改",
          },
          {
            $type: "sonicRecordActionDeleteEntity",
            code: "delete",
            actionType: "delete",
            actionText: "删除",
            dataSourceCode: "list",
            entityCode: "SysActionGroup",
          },
        ],
        newForm: cloneDeep(actionGroupFormConfig),
        editForm: cloneDeep(actionGroupFormConfig),
      } as SonicEntityListRockConfig,
      secondary: [
        {
          $type: "sonicEntityList",
          entityCode: "SysAction",
          viewMode: "table",
          selectionMode: "none",
          fixedFilters: [
            {
              field: "group_id",
              operator: "eq",
              value: "",
            },
          ],
          listActions: [
            {
              $type: "sonicToolbarNewEntityButton",
              text: "新建",
              icon: "PlusOutlined",
              actionStyle: "primary",
            },
            // {
            //   $type: "sonicToolbarRefreshButton",
            //   text: "刷新",
            //   icon: "ReloadOutlined",
            // },
          ],
          pageSize: -1,
          orderBy: [
            {
              field: "orderNum",
            },
          ],
          columns: [
            {
              type: "auto",
              code: "orderNum",
              width: "100px",
            },
            {
              type: "auto",
              code: "group",
              width: "150px",
              rendererProps: {
                format: "{{name}}",
              },
            },
            {
              type: "auto",
              code: "name",
              width: "200px",
            },
            {
              type: "auto",
              code: "code",
              width: "250px",
            },
            {
              type: "auto",
              code: "description",
            },
          ],
          actions: [
            {
              $type: "sonicRecordActionEditEntity",
              code: "edit",
              actionType: "edit",
              actionText: "修改",
            },
            {
              $type: "sonicRecordActionDeleteEntity",
              code: "delete",
              actionType: "delete",
              actionText: "删除",
              dataSourceCode: "list",
              entityCode: "SysAction",
            },
          ],
          newForm: cloneDeep(actionFormConfig),
          editForm: cloneDeep(actionFormConfig),
          $exps: {
            _hidden: "!$scope.vars.activeId",
            "fixedFilters[0].value": "$scope.vars.activeId",
            "newForm.fixedFields.group_id": "$scope.vars.activeId",
          },
        },
      ],
    },
  ],
};

export default page;
