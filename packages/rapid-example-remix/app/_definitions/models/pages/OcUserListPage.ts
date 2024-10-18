import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "login",
    },
    {
      type: "auto",
      code: "email",
    },
    {
      type: "auto",
      code: "avatar",
    },
    {
      type: "auto",
      code: "birthday",
    },
    {
      type: "treeSelect",
      code: "department",
      formControlProps: {
        listDataSourceCode: "departments",
        listParentField: "parent.id",
      },
    },
    {
      type: "auto",
      code: "roles",
      // formControlType: "rapidCheckboxListFormInput",
      // formControlProps: {
      //   direction: "vertical",
      // },
      formControlProps: {
        width: "100%",
      },
      listDataFindOptions: {
        orderBy: [
          {
            field: "orderNum",
          },
        ],
      },
    },
    {
      type: "radioList",
      code: "state",
      formControlProps: {
        direction: "vertical",
      },
    },
  ],
};

const page: RapidPage = {
  code: "oc_user_list",
  name: "用户列表",
  title: "用户管理",
  permissionCheck: { any: [] },
  view: [
    {
      $id: "userList",
      $type: "sonicEntityList",
      entityCode: "OcUser",
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
          filterFields: ["login", "name"],
        },
      ],
      fixedFilters: [
        {
          operator: "null",
          field: "deletedAt",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "link",
          code: "name",
          fixed: "left",
          rendererProps: {
            url: "/pages/oc_user_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "login",
          fixed: "left",
        },
        {
          type: "auto",
          code: "email",
          width: "200px",
        },
        {
          type: "auto",
          code: "avatar",
          width: "200px",
          rendererType: "antdAvatar",
          rendererProps: {
            shape: "square",
            size: "large",
            $exps: {
              _hidden: "!$slot.value",
              src: "`/api/download/file?fileKey=${encodeURIComponent($slot.value?.key)}`",
            },
          },
        },
        {
          type: "auto",
          code: "birthday",
          width: "120px",
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
          code: "createdBy",
          width: "150px",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      actionsColumnWidth: "200px",
      actions: [
        {
          $type: "rapidFormModalRecordAction",
          code: "resetPassword",
          actionText: "重置密码",
          modalTitle: "重置密码",
          form: {
            $type: "rapidForm",
            items: [
              {
                type: "password",
                code: "password",
                label: "新密码",
                required: true,
                rules: [
                  // eslint-disable-next-line no-template-curly-in-string
                  { required: true, message: "请输入${label}" },
                ],
              },
            ],
          },
          successMessage: "密码重置成功。",
          errorMessage: "密码重置失败。",
          onModalOk: [
            {
              $action: "sendHttpRequest",
              url: `/api/resetPassword`,
              method: "POST",
              data: { password: "" },
              $exps: {
                data: "$event.args[0]",
              },
            },
          ],
          $exps: {
            "form.fixedFields.userId": "$slot.record.id",
          },
        },
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
        },
        {
          $type: "rapidTableAction",
          code: "disable",
          actionText: "禁用",
          $exps: {
            _hidden: "$slot.record.state !== 'enabled'",
          },
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { state: "disabled" },
              $exps: {
                url: `"/api/app/oc_users/" + $event.args[0].recordId`,
              },
            },
            {
              $action: "loadStoreData",
              storeName: "list",
            },
          ],
        },
        {
          $type: "rapidTableAction",
          code: "enable",
          actionText: "启用",
          $exps: {
            _hidden: "$slot.record.state === 'enabled'",
          },
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { state: "enabled" },
              $exps: {
                url: `"/api/app/oc_users/" + $event.args[0].recordId`,
              },
            },
            {
              $action: "loadStoreData",
              storeName: "list",
            },
          ],
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "OcUser",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      searchForm: {
        entityCode: "OcUser",
        items: [
          {
            type: "auto",
            code: "login",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "name",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "state",
            filterMode: "eq",
          },
        ],
      },
      stores: [
        {
          type: "entityStore",
          name: "departments",
          entityCode: "OcDepartment",
          properties: ["id", "code", "name", "parent", "orderNum", "createdAt"],
          filters: [],
          orderBy: [
            {
              field: "orderNum",
            },
          ],
        },
      ],
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
