const entityLocales: Record<string, {translation: Record<string, any>}> = {
  "en-US": {
    translation: {
      entities: {
      "BaseShift": {
        name: "Shift",
        fields: {
          "name": {
            name: "Name",
          },
          "beginTime": {
            name: "Begin Time",
          },
          "endTime": {
            name: "End Time",
          },
        },
      },
      "OcDepartment": {
        name: "Department",
        fields: {
          "parent": {
            name: "Parent Department",
          },
          "code": {
            name: "Code",
          },
          "name": {
            name: "Name",
          },
          "orderNum": {
            name: "Order",
          },
          "users": {
            name: "Users",
          },
        },
      },
      "OcRole": {
        fields: {
          "actions": {
            name: "Actions",
          },
        },
      },
      "OcUser": {
        fields: {
          "hidden": {
            name: "Hidden",
          },
          "birthday": {
            name: "Birthday",
          },
          "avatar": {
            name: "Avatar",
          },
          "department": {
            name: "Department",
          },
          "roles": {
            name: "Roles",
          },
        },
      },
      "PmBugIssue": {
        fields: {
        },
      },
      "PmLog": {
        fields: {
        },
      },
      "PmProject": {
        fields: {
        },
      },
      "PmTask": {
        fields: {
        },
      },
      "SysAction": {
        fields: {
        },
      },
      "SysActionGroup": {
        fields: {
        },
      },
      "SysCronJob": {
        fields: {
        },
      },
      },
    },
  },
  "zh-CN": {
    translation: {
      entities: {
      "BaseShift": {
        name: "班次",
        fields: {
          "name": {
            name: "名称",
          },
          "beginTime": {
            name: "开始时间",
          },
          "endTime": {
            name: "结束时间",
          },
        },
      },
      "OcDepartment": {
        name: "部门",
        fields: {
          "parent": {
            name: "上级部门",
          },
          "code": {
            name: "编码",
          },
          "name": {
            name: "名称",
          },
          "orderNum": {
            name: "排序",
          },
          "users": {
            name: "用户",
          },
        },
      },
      "OcRole": {
        fields: {
          "actions": {
            name: "操作",
          },
        },
      },
      "OcUser": {
        fields: {
          "hidden": {
            name: "是否隐藏",
          },
          "birthday": {
            name: "生日",
          },
          "avatar": {
            name: "头像",
          },
          "department": {
            name: "部门",
          },
          "roles": {
            name: "角色",
          },
        },
      },
      "PmBugIssue": {
        fields: {
        },
      },
      "PmLog": {
        fields: {
        },
      },
      "PmProject": {
        fields: {
        },
      },
      "PmTask": {
        fields: {
        },
      },
      "SysAction": {
        fields: {
        },
      },
      "SysActionGroup": {
        fields: {
        },
      },
      "SysCronJob": {
        fields: {
        },
      },
      },
    },
  },
  "th-TH": {
    translation: {
      entities: {
      "BaseShift": {
        fields: {
        },
      },
      "OcDepartment": {
        fields: {
        },
      },
      "OcRole": {
        fields: {
          "actions": {
            name: "การดำเนินการ",
          },
        },
      },
      "OcUser": {
        fields: {
          "hidden": {
            name: "ซ่อน",
          },
          "birthday": {
            name: "วันเกิด",
          },
          "avatar": {
            name: "รูปภาพ",
          },
          "department": {
            name: "แผนก",
          },
          "roles": {
            name: "บทบาท",
          },
        },
      },
      "PmBugIssue": {
        fields: {
        },
      },
      "PmLog": {
        fields: {
        },
      },
      "PmProject": {
        fields: {
        },
      },
      "PmTask": {
        fields: {
        },
      },
      "SysAction": {
        fields: {
        },
      },
      "SysActionGroup": {
        fields: {
        },
      },
      "SysCronJob": {
        fields: {
        },
      },
      },
    },
  },
};
export default entityLocales;