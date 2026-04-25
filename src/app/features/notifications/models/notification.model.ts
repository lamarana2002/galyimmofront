export interface NotificationModel {
  id:          string | number;
  type:        string;
  sujet:       string;   // Correspond au titre
  message:     string;   // Correspond à la description
  data:        any;      // Données brutes
  lu:          boolean;  // Est lu ou non
  lu_at:       string | null;
  created_at:  string;
}
