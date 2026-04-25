import { StructurePlanType } from '../enums/structure-plan-type.enum';
import { StructureStatus }   from '../enums/structure-status.enum';
import { UserModel }         from '../../users/models/user.model';
import { PropertyModel }     from '../../properties/models/property.model';
import { PropertyDocument }  from '../../properties/models/property-document.model';

// ── Correspond à la migration structures ──────────────────────────

export interface StructureModel {
  // ── Champs Laravel (snake_case) ─────────────────────────────────
  id:          number;
  name:        string;
  cover:       string | null;
  logo:        string | null;
  facebook:    string | null;
  web_site:    string | null;
  plan:        StructurePlanType;
  status:      StructureStatus;
  description: string | null;
  deleted_at:  string | null;
  created_at:  string;
  updated_at:  string;

  users?:      UserModel[];
  owner?:      UserModel;
  properties?: PropertyModel[];
  documents?:  PropertyDocument[];

  stats: {
    employes:  number;   // COUNT(users WHERE structure_id = ?)
    biens:     number;   // COUNT(properties WHERE structure_id = ?)
    locations: number;   // COUNT(unite_locations WHERE status = 'rented')
  };

  metrics: {
    tauxOccupation: number;    // en %
    revenuMensuel: number;
    derniereConnexion: string;
    contratsActifs: number;
  }

  activites: StructureActivity[];

  // Vont deriver des audits
  lastActivity?:     string;
  lastActivityType?: string;
}

export interface StructureActivity {
  id:          number;
  log_name:    string;      // 'structure', 'bien', 'contrat'
  description: string;      // 'created', 'updated', 'status_changed'
  event:       string;
  created_at:  string;
  causer?: Pick<UserModel, 'id' | 'nom' | 'prenom' | 'avatar'>;
}
