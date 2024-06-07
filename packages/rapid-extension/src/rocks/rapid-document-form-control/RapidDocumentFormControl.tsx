import type { Rock } from "@ruiapp/move-style";
import RapidToolbarLinkMeta from "./RapidDocumentFormControlMeta";
import { renderRock } from "@ruiapp/react-renderer";
import type { RapidDocumentFormControlRockConfig } from "./rapid-document-form-control-types";
import { RapidUploaderFormInputRockConfig } from "../rapid-uploader-form-input/rapid-uploader-form-input-types";

export default {
  Renderer(context, props) {
    const rockConfig: RapidUploaderFormInputRockConfig = {
      $id: props.$id,
      $type: "rapidUploaderFormInput",
      uploadProps: props.uploadProps,
      onUploaded: props.onUploaded,
      form: props.form,
    };

    return renderRock({
      context,
      rockConfig,
    });
  },

  ...RapidToolbarLinkMeta,
} as Rock<RapidDocumentFormControlRockConfig>;
