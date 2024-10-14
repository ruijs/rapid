import typescript from "rollup-plugin-typescript2";
// import tsConfigPaths from "rollup-plugin-tsconfig-paths"
import postcss from "rollup-plugin-postcss";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import cssImport from "postcss-import";

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
    nodeResolve(),
    commonjs(),
    typescript(),
    // tsConfigPaths(),
    postcss({ extract: true, plugins: [cssImport()] }),
  ],
  external: ["@ant-design/icons", "@ruiapp/move-style", "@ruiapp/react-renderer", "antd", "axios", "dayjs", "lodash", "react", "react/jsx-runtime"],
};
