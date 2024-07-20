import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "state",
    },
    {
      type: "auto",
      code: "allowedTaskTypes",
    },
  ],
};

const page: RapidPage = {
  code: "pm_project_list",
  name: "项目列表",
  title: "项目列表",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "PmProject",
      viewMode: "table",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "Search",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["name", "description"],
        },
      ],
      orderBy: [
        {
          field: "orderNum",
        },
      ],
      pageSize: 20,
      searchForm: {
        items: [
          {
            type: "auto",
            code: "name",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "state",
            filterMode: "in",
            itemType: "text",
          },
          {
            type: "auto",
            code: "allowedTaskTypes",
            filterMode: "arrayOverlap",
            multipleValues: true,
          },
        ],
      },
      columns: [
        {
          type: "auto",
          code: "orderNum",
          width: "200px",
        },
        {
          type: "link",
          code: "name",
          width: "200px",
          rendererProps: {
            url: "/pages/pm_project_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "description",
        },
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "auto",
          code: "allowedTaskTypes",
          width: "250px",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
        {
          type: "auto",
          code: "createdBy",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
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
          entityCode: "PmProject",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {},
    } as SonicEntityListRockConfig,
  ],
};

export default page;
