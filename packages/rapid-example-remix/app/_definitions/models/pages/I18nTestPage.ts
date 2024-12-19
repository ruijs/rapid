import type { RapidPage } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "i18n_test",
  name: "i18n 测试",
  title: "i18n 测试",
  permissionCheck: { any: [] },
  view: [
    {
      $id: "hello",
      $type: "text",
      $locales: {
        text: {
          "zh-CN": "你好",
          "en-US": "Hello",
        },
      },
    },
  ],
};

export default page;
