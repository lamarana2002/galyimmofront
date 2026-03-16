import { CreatePropertyPayload } from "./create-property-payload.interface";

// update-property-payload.interface.ts
export interface UpdatePropertyPayload extends Partial<CreatePropertyPayload> {
  id: number;
}