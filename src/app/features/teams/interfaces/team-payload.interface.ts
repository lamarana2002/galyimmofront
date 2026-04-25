import { TeamModel } from '../models/team.model';

export interface CreateTeamPayload {
  name: string;
  role?: string;
  description?: string;
  image?: File | null;
  is_public?: boolean;
  sort_order?: number;
}

export interface UpdateTeamPayload extends CreateTeamPayload {
  id: number;
}

export const emptyTeamForm = (): CreateTeamPayload => ({
  name: '',
  role: '',
  description: '',
  image: null,
  is_public: true,
  sort_order: 0,
});

export const teamToUpdatePayload = (team: TeamModel): UpdateTeamPayload => ({
  id: team.id,
  name: team.name,
  role: team.role ?? '',
  description: team.description ?? '',
  image: undefined,
  is_public: team.is_public,
  sort_order: team.sort_order,
});
