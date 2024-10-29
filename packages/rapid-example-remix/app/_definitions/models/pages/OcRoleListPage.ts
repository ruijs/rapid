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
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "state",
    },
  ],
};

const page: RapidPage = {
  code: "oc_role_list",
  name: "角色列表",
  title: "角色管理",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "OcRole",
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
      relations: {
        createdBy: {
          relations: {
            roles: true,
          },
        },
      },
      orderBy: [
        {
          field: "orderNum",
        },
      ],
      showRowNumColumn: true,
      pageSize: 20,
      columns: [
        {
          type: "link",
          code: "name",
          fixed: "left",
          width: "300px",
          rendererProps: {
            url: "/pages/oc_role_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "description",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "100px",
        },
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "auto",
          code: "createdBy",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
          $exps: {
            _hidden: "true",
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
          $type: "sonicRecordActionUpdateEntity",
          code: "disable",
          actionText: "禁用",
          entity: {
            state: "disabled",
          },
          $exps: {
            _hidden: "$slot.record.state !== 'enabled'",
          },
        },
        {
          $type: "sonicRecordActionUpdateEntity",
          code: "enable",
          actionText: "启用",
          entity: {
            state: "enabled",
          },
          $exps: {
            _hidden: "$slot.record.state === 'enabled'",
          },
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionText: "删除",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    } as SonicEntityListRockConfig,
  ],
};

export default page;
