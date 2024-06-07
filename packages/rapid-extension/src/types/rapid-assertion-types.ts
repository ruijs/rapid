export type RapidActionPermissionCheck<TActionCodes = string> = {
  any?: TActionCodes[];
  all?: TActionCodes[];
};
