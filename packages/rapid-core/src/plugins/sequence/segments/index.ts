import { SegmentResolver } from "../SequenceService";
import * as literal from "./literal";
import * as year from "./year";
import * as month from "./month";
import * as dayOfMonth from "./dayOfMonth";
import * as parameter from "./parameter";
import * as autoIncrement from "./autoIncrement";

export default [
  literal,
  year,
  month,
  dayOfMonth,
  parameter,
  autoIncrement,
] satisfies SegmentResolver[];