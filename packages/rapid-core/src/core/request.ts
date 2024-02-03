export const GlobalRequest = global.Request;


export interface RapidRequestBody {
  type: string;
  value: any;
}

export class RapidRequest {
  method: string;
  url: URL;
  hasBody: boolean;

  constructor(init: RequestInit) {
  }

  body(): RapidRequestBody {
    return {
      type: "",
      value: {}
    }
  }
}
