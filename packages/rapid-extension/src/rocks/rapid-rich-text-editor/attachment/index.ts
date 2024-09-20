import "./lang"; // 多语言

import { IModuleConf } from "@wangeditor/editor";
import withAttachment from "./plugin";
import renderElemConf from "./renderDom";
import elemToHtmlConf from "./insertDom";
import parseHtmlConf from "./parseDom";
import { uploadAttachmentMenuConf, downloadAttachmentMenuConf } from "./menu";

const module: Partial<IModuleConf> = {
  editorPlugin: withAttachment,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [uploadAttachmentMenuConf, downloadAttachmentMenuConf],
};

export default module;
