import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe, TitleCasePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCrown,
  lucideBuilding2,
  lucideBuilding,
  lucideCheckCircle,
  lucideXCircle,
  lucideClock,
  lucideGlobe,
  lucideUsers,
  lucideKey,
  lucideCalendar,
  lucideUser,
  lucideMail,
  lucidePhone,
  lucideMapPin,
  lucideAlignLeft,
  lucideLink,
  lucideInfo,
  lucideFile,
  lucideDownload,
  lucideHistory,
  lucideUserX,
  lucideFileX,
  lucidePause,
  lucidePlay,
  lucideRefreshCw,
  lucideTrash2,
  lucideSend,
  lucideX,
  lucideEdit,
  lucideCreditCard,
  lucideCheck,
  lucideBan,
  lucideTrendingUp,
  lucideAlertTriangle,
  lucideMessageSquare,
  lucideShield,
  lucideActivity,
} from '@ng-icons/lucide';
import { PropertiesTab } from '../../components/structure-detail/properties-tab/properties-tab';
import { OwnerTap } from '../../components/structure-detail/owner-tap/owner-tap';
import { UsersTab } from '../../components/structure-detail/users-tab/users-tab';
import { DocumentsTab } from '../../components/structure-detail/documents-tab/documents-tab';
import { FinancialTab } from '../../components/structure-detail/financial-tab/financial-tab';
import { SettingsTab } from '../../components/structure-detail/settings-tab/settings-tab';
import { AuditTab } from '../../components/structure-detail/audit-tab/audit-tab';
import { ChangePlanModal } from "../../components/structure-detail/change-plan-modal/change-plan-modal";
import { Subscription } from 'rxjs';
import { StructureService } from '../../services/structure.service';
import { StructureModel } from '../../models/structure.model';
import { StructureStatus } from '../../enums/structure-status.enum';
import { StructurePlanType } from '../../enums/structure-plan-type.enum';
import { ContactStructureModal } from "../../components/structure-detail/contact-structure-modal/contact-structure-modal";

export type StatutType = 'approuvé' | 'rejeté' | 'en_attente' | 'suspendu';
export type PlanType = 'premium' | 'freemium';

export interface StructureMember {
  name: string;
  email: string;
  telephone?: string;
  ville?: string;
  pays?: string;
  avatar?: string;
  role?: string;
  statut?: 'actif' | 'bloqué' | 'en_attente';
  depuis?: Date;
  memberSince?: Date;
  description?: string;
}

export interface StructureBien {
  id: number;
  nom: string;
  type: string;
  statut: 'loué' | 'disponible';
  adresse?: string;
}

export interface StructureDocument {
  id: number;
  nom: string;
  ext: string;
  date: Date;
}

export interface StructureActivite {
  id: number;
  causer: string;
  description: string;
  date: string;
  type?: 'admin' | 'user';
}

export interface StructurePayment {
  id: number;
  date: Date;
  montant: number;
  statut: 'payé' | 'en_attente' | 'échoué';
  description: string;
}

export interface StructureDetail {
  id: number;
  name: string;
  description?: string;
  cover?: string;
  plan: PlanType;
  statut: StatutType;
  webSite?: string;
  facebook?: string;
  createdAt: Date;
  planExpiresAt?: Date;
  stats: { employes: number; locations: number; biens: number };
  metrics: {
    tauxOccupation: number;
    revenuMensuel: number;
    derniereConnexion: string;
    contratsActifs: number;
  };
  proprietaire?: StructureMember;
  biens?: StructureBien[];
  employes?: StructureMember[];
  documents?: StructureDocument[];
  activites?: StructureActivite[];
  paiements?: StructurePayment[];
}

@Component({
  selector: 'app-structure-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconComponent,
    DatePipe,
    SlicePipe,
    TitleCasePipe,
    CurrencyPipe,
    PropertiesTab,
    OwnerTap,
    UsersTab,
    DocumentsTab,
    FinancialTab,
    SettingsTab,
    AuditTab,
    ChangePlanModal,
    ContactStructureModal
],
  templateUrl: './structure-details.html',
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideCrown,
      lucideBuilding2,
      lucideBuilding,
      lucideCheckCircle,
      lucideXCircle,
      lucideClock,
      lucideGlobe,
      lucideUsers,
      lucideKey,
      lucideCalendar,
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideMapPin,
      lucideAlignLeft,
      lucideLink,
      lucideInfo,
      lucideFile,
      lucideDownload,
      lucideHistory,
      lucideUserX,
      lucideFileX,
      lucidePause,
      lucidePlay,
      lucideRefreshCw,
      lucideTrash2,
      lucideSend,
      lucideX,
      lucideEdit,
      lucideCreditCard,
      lucideCheck,
      lucideBan,
      lucideTrendingUp,
      lucideAlertTriangle,
      lucideMessageSquare,
      lucideShield,
      lucideActivity,
    }),
  ],
})
export class StructureDetails implements OnInit, OnDestroy {
  activeTab = 'proprietaire';
  id: number = 0;

  structure?:StructureModel;
  router = inject(ActivatedRoute);
  structureService = inject(StructureService);
  private cdr = inject(ChangeDetectorRef);
  sub = new Subscription();

  tabs = [
    { key: 'proprietaire', label: 'Propriétaire', icon: 'lucideUser' },
    { key: 'biens', label: 'Biens', icon: 'lucideBuilding' },
    { key: 'employes', label: 'Employés', icon: 'lucideUsers' },
    { key: 'documents', label: 'Documents', icon: 'lucideFile' },
    { key: 'financier', label: 'Financier', icon: 'lucideCreditCard' },
    { key: 'parametres', label: 'Paramètres', icon: 'lucideInfo' },
    { key: 'activite', label: 'Activité', icon: 'lucideHistory' },
  ];

  // ── UI states ─────────────────────────────────────────────────
  showContactModal = false;
  showDeleteConfirm = false;
  showPlanModal = false;
  contactMessage = '';
  contactSubject = '';
  selectedPlan: StructurePlanType | undefined = StructurePlanType.PREMIUM;

  StructureStatus = StructureStatus


  // ── Données mock ──────────────────────────────────────────────
  structureMock: StructureDetail = {
    id: 1,
    name: 'Immo Prestige CI',
    description: 'Agence spécialisée dans la vente et location de biens haut de gamme à Abidjan.',
    plan: 'premium',
    statut: 'approuvé',
    webSite: 'https://immoprestige.ci',
    facebook: 'https://facebook.com/immoprestige',
    createdAt: new Date('2024-01-15T09:30:00'),
    planExpiresAt: new Date('2025-01-15'),
    stats: { employes: 8, locations: 14, biens: 23 },
    metrics: {
      tauxOccupation: 78,
      revenuMensuel: 4200000,
      derniereConnexion: 'il y a 2 heures',
      contratsActifs: 11,
    },
    proprietaire: {
      name: 'Koné Mamadou',
      email: 'kone.mamadou@immoprestige.ci',
      telephone: '+225 07 12 34 56',
      ville: 'Abidjan',
      pays: "Côte d'Ivoire",
      memberSince: new Date('2023-06-01'),
      description: "Entrepreneur passionné d'immobilier depuis plus de 10 ans.",
    },
    biens: [
      {
        id: 1,
        nom: 'Villa Cocody Les Deux Plateaux',
        type: 'villa',
        statut: 'loué',
        adresse: 'Cocody, Abidjan',
      },
      {
        id: 2,
        nom: 'Appt T3 Marcory Zone 4',
        type: 'appartement',
        statut: 'disponible',
        adresse: 'Marcory, Abidjan',
      },
      {
        id: 3,
        nom: 'Bureau Plateau Centre',
        type: 'commercial',
        statut: 'loué',
        adresse: 'Le Plateau, Abidjan',
      },
      {
        id: 4,
        nom: 'Terrain Bingerville 800m²',
        type: 'terrain',
        statut: 'disponible',
        adresse: 'Bingerville',
      },
    ],
    employes: [
      {
        name: 'Diallo Fatou',
        email: 'f.diallo@immoprestige.ci',
        telephone: '+225 07 98 76 54',
        role: 'Gestionnaire',
        statut: 'actif',
        depuis: new Date('2023-07-10'),
      },
      {
        name: 'Ouédraogo Jean',
        email: 'j.ouedraogo@immoprestige.ci',
        telephone: '+225 05 44 33 22',
        role: 'Commercial',
        statut: 'actif',
        depuis: new Date('2023-09-01'),
      },
      {
        name: 'Traoré Amina',
        email: 'a.traore@immoprestige.ci',
        telephone: '—',
        role: 'Comptable',
        statut: 'en_attente',
        depuis: new Date('2024-03-15'),
      },
      {
        name: 'Bamba Seydou',
        email: 's.bamba@immoprestige.ci',
        telephone: '+225 01 22 33 44',
        role: 'Technicien',
        statut: 'bloqué',
        depuis: new Date('2023-11-20'),
      },
    ],
    documents: [
      { id: 1, nom: 'Contrat de bail - Villa Cocody', ext: 'pdf', date: new Date('2024-02-10') },
      { id: 2, nom: 'Registre de commerce', ext: 'pdf', date: new Date('2024-01-16') },
      { id: 3, nom: 'Bilan comptable 2023', ext: 'xlsx', date: new Date('2024-03-01') },
      { id: 4, nom: 'Statuts de la société', ext: 'docx', date: new Date('2024-01-15') },
      { id: 5, nom: 'Photo façade bureau principal', ext: 'jpg', date: new Date('2024-01-20') },
    ],
    activites: [
      {
        id: 1,
        causer: 'Super Admin',
        description: 'Structure approuvée après vérification des documents.',
        date: 'il y a 2 jours',
        type: 'admin',
      },
      {
        id: 2,
        causer: 'Koné Mamadou',
        description: 'Document "Registre de commerce" ajouté.',
        date: 'il y a 3 jours',
        type: 'user',
      },
      {
        id: 3,
        causer: 'Diallo Fatou',
        description: 'Nouveau bien "Bureau Plateau Centre" enregistré.',
        date: 'il y a 5 jours',
        type: 'user',
      },
      {
        id: 4,
        causer: 'Super Admin',
        description: 'Plan changé : Freemium → Premium.',
        date: 'il y a 6 jours',
        type: 'admin',
      },
      {
        id: 5,
        causer: 'Super Admin',
        description: 'Structure créée et mise en attente de validation.',
        date: 'il y a 7 jours',
        type: 'admin',
      },
    ],
    paiements: [
      {
        id: 1,
        date: new Date('2024-01-15'),
        montant: 150000,
        statut: 'payé',
        description: 'Abonnement Premium - Janvier 2024',
      },
      {
        id: 2,
        date: new Date('2024-02-15'),
        montant: 150000,
        statut: 'payé',
        description: 'Abonnement Premium - Février 2024',
      },
      {
        id: 3,
        date: new Date('2024-03-15'),
        montant: 150000,
        statut: 'payé',
        description: 'Abonnement Premium - Mars 2024',
      },
      {
        id: 4,
        date: new Date('2024-04-15'),
        montant: 150000,
        statut: 'en_attente',
        description: 'Abonnement Premium - Avril 2024',
      },
    ],
  };

  ngOnInit(): void {
    this.router.params.subscribe(params => {
      this.id = params['structureId'];
    });
    this.loadDetails();
  }

  // Charger les details de la structure
  loadDetails(){
    this.sub = this.structureService.findById(this.id).subscribe({
      next: (response) => {
        this.structure = response.data;
        console.log(this.structure);
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err),
    })
  }

  // ── Actions admin ─────────────────────────────────────────────
  changeStatus(status: StructureStatus){
  }

  toggleSuspend(): void {
    if (this.structure?.status === StructureStatus.SUSPENDED) {
      
      // this.structure?.status = 'approuvé';
      this.addAuditLog("Structure réactivée par l'administrateur.");
    } else {
      // this.structure?.status = StructureStatus.SUSPENDED;
      this.addAuditLog("Structure suspendue par l'administrateur.");
    }
  }
  confirmChangePlan(selectedPlan: PlanType): void {
    // const old = this.structure.plan;
    // this.structure.plan = this.selectedPlan;
    this.showPlanModal = false;
    // this.addAuditLog(`Plan modifié : ${old} → ${this.selectedPlan}.`);
  }
  openChangePlan(): void {
    this.selectedPlan = this.structure?.plan;
    this.showPlanModal = true;
  }

  sendContactMessage(): void {
    console.log('Message envoyé à', this.structure?.owner?.email);
    this.addAuditLog(`Message envoyé au propriétaire : "${this.contactSubject}".`);
    this.showContactModal = false;
    this.contactMessage = '';
    this.contactSubject = '';
  }

  deleteStructure(): void {
    console.log('Supprimer structure', this.id);
    this.showDeleteConfirm = false;
  }

  private addAuditLog(description: string): void {
    // this.structure?.activites?.unshift({
    //   id: Date.now(),
    //   // causer: 'Super Admin',
    //   description,
    //   date: "à l'instant",
    //   type: 'admin',
    // });
  }

  // ── Helpers ───────────────────────────────────────────────────
  getStatutLabel(s?: string): string {
    const m: Record<string, string> = {
      approuvé: 'Approuvée',
      rejeté: 'Rejetée',
      en_attente: 'En attente',
      suspendu: 'Suspendue',
    };
    return s? m[s] : 'non renseigne';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getDocIconColor(ext: string): string {
    const m: Record<string, string> = {
      pdf: 'text-red-600 bg-red-100',
      doc: 'text-blue-600 bg-blue-100',
      docx: 'text-blue-600 bg-blue-100',
      xls: 'text-green-600 bg-green-100',
      xlsx: 'text-green-600 bg-green-100',
      jpg: 'text-purple-600 bg-purple-100',
      png: 'text-purple-600 bg-purple-100',
    };
    return m[ext] ?? 'text-gray-500 bg-gray-100';
  }

  get totalEnAttente(): number {
    // return (
    //   this.structure.paiements
    //     ?.filter((p) => p.statut === 'en_attente')
    //     .reduce((a, p) => a + p.montant, 0) ?? 0
    // );
    return 50000;
  }

  get totalRevenu(): number {
    // return (
    //   this.structure.paiements
    //     ?.filter((p) => p.statut === 'payé')
    //     .reduce((a, p) => a + p.montant, 0) ?? 0
    // );
    return 200000;
  }

  get planDaysLeft(): number {
    if (!this.structure?.created_at) return 0;
    return Math.max(0, Math.ceil((new Date(this.structure.created_at).getTime() - Date.now()) / 86400000));
    // if (!this.structure.planExpiresAt) return 0;
    // return Math.max(0, Math.ceil((this.structure.planExpiresAt.getTime() - Date.now()) / 86400000));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
