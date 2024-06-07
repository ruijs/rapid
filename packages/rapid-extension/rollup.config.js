import typescript from "rollup-plugin-typescript2";
// import tsConfigPaths from "rollup-plugin-tsconfig-paths"

export default {
  input: ["src/mod.ts"],
  output: [
    {
      dir: "dist",
      entryFileNames: "[name].js",
      format: "cjs",
      exports: "named",
    },
  ],
  plugins: [
    typescript(),
    // tsConfigPaths(),
  ],
  external: ["@ant-design/icons", "@ruiapp/move-style", "@ruiapp/react-renderer", "antd", "axios", "dayjs", "lodash", "react", "react/jsx-runtime"],
};
