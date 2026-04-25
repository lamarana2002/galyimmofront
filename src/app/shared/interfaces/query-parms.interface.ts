import { StructurePlanType } from "../../features/structures/enums/structure-plan-type.enum";
import { StructureStatus } from "../../features/structures/enums/structure-status.enum";

export interface IQueryParam {
  page?:    number;
  perPage?: number;
  search?:  string;
}