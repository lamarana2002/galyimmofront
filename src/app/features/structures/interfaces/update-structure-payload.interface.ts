import { CreateStructurePayload } from "./create-structure-payload.interface";

export interface UpdateStructurePayload extends Partial<CreateStructurePayload> {
  id: number;
}