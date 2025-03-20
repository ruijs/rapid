import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "title",
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "state",
    },
  ],
};

const page: RapidPage = {
  code: "pm_task_list",
  name: "Task列表",
  title: "Task列表",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "PmTask",
      viewMode: "table",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
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
          filterFields: ["title", "description"],
        },
      ],
      orderBy: [
        {
          field: "project.orderNum",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "code",
          width: "100px",
        },
        {
          type: "auto",
          code: "project",
          width: "100px",
        },
        {
          type: "auto",
          code: "taskType",
          width: "100px",
        },
        {
          type: "link",
          code: "title",
          fixed: "left",
          width: "300px",
          rendererProps: {
            url: "/pages/pm_bug_issue_details?id={{id}}",
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
          code: "createdAt",
          width: "150px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
        },
        {
          $type: "sonicRecordActionEditEntity",
          code: "rename",
          actionText: "重命名",
          entityCode: "PmTask",
          modalTitle: "重命名",
          successMessage: "重命名成功",
          errorMessage: "重命名失败",
          dataSourceCode: "list",
          form: {
            lazyLoadData: true,
            items: [
              {
                type: "auto",
                code: "title",
              },
            ],
          },
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.fixedFields.taskType": "'bug'",
      },
    },
  ],
};

export default page;
