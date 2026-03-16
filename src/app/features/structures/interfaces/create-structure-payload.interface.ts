import { StructurePlanType } from "../enums/structure-plan-type.enum";

export interface CreateStructurePayload {
  name:         string;
  plan:         StructurePlanType;
  description?: string;
  facebook?:    string;
  web_site?:    string;
  logo?:        File;
  cover?:       File;
}