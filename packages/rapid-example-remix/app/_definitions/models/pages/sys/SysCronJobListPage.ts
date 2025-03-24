import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "cronTime",
    },
    {
      type: "auto",
      code: "disabled",
    },
    {
      type: "auto",
      code: "jobOptions",
    },
  ],
};

const page: RapidPage = {
  code: "sys_cron_job_list",
  name: "定时任务列表",
  title: "定时任务管理",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "SysCronJob",
      viewMode: "table",
      listActions: [],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "Search",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "description"],
        },
      ],
      orderBy: [
        {
          field: "code",
        },
      ],
      showRowNumColumn: true,
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "code",
          width: "150px",
        },
        {
          type: "auto",
          code: "description",
        },
        {
          type: "auto",
          code: "cronTime",
          width: "100px",
        },
        {
          type: "auto",
          code: "disabled",
          width: "100px",
        },
        {
          type: "auto",
          code: "isRunning",
          width: "100px",
        },
        {
          type: "auto",
          code: "nextRunningTime",
          width: "160px",
        },
        {
          type: "auto",
          code: "lastRunningTime",
          width: "160px",
        },
        {
          type: "auto",
          code: "lastRunningResult",
          width: "120px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
        },
        {
          $type: "sonicRecordActionUpdateEntity",
          code: "disable",
          actionText: "禁用",
          entity: {
            disabled: true,
          },
          $exps: {
            _hidden: "$slot.record.disabled",
          },
        },
        {
          $type: "sonicRecordActionUpdateEntity",
          code: "enable",
          actionText: "启用",
          entity: {
            disabled: false,
          },
          $exps: {
            _hidden: "!$slot.record.disabled",
          },
        },
      ],
      editForm: cloneDeep(formConfig),
    } as SonicEntityListRockConfig,
  ],
};

export default page;
