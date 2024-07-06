import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "name",
    },
    {
      type: "textarea",
      code: "description",
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
          field: "id",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "name",
          width: "200px",
        },
        {
          type: "auto",
          code: "description",
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
