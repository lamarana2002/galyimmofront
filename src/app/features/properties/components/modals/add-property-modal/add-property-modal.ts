import { Component, inject, input, OnInit, OnDestroy, output, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PropertyService } from '../../../services/property.service';
import { PropertyTypeService } from '../../../services/property-type.service';
import { PropertyStatusEnum } from '../../../enums/property-status.enum';
import { PropertyTypeModel } from '../../../models/propety-type.model';
import { PropertyModel } from '../../../models/property.model';
import { CreatePropertyPayload } from '../../../interfaces/create-property-payload.interface';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import {
  lucideAlertTriangle,
  lucideBriefcase,
  lucideHouse,
  lucideImage,
  lucideMapPin,
  lucideSave,
  lucideShoppingBag,
  lucidePencil,
  lucidePlus,
  lucideX,
  lucideInfo,
  lucideLayoutGrid,
  lucideBanknote,
} from '@ng-icons/lucide';
import { ToastService } from '../../../../../shared/services/toast.service';
import { GeoService } from '../../../../../shared/services/geo.service';
import { ICountry, IRegion, IVille, ICommune, IQuartier, ISquareArea, IAdresse } from '../../../../../shared/models/adresse.model';

interface PropertyForm {
  name: string;
  code: string | null;
  property_type_id: string;
  status: string;
  square_area_id: number | null;
  repere: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  what3words: string | null;
  total_surface: number | null;
  total_floors: number | null;
  sale_price: number | null;
  condo_fees: number | null;
  has_units: boolean;
  is_active: boolean;
  description: string | null;
  cover_image: File | null;
  cover_image_preview: string | null;
  amenities: string;
}

@Component({
  selector: 'app-add-property-modal',
  imports: [NgIcon, FormsModule],
  templateUrl: './add-property-modal.html',
  styleUrl: './add-property-modal.css',
  viewProviders: [
    provideIcons({ 
      lucideImage, 
      lucideSave, 
      lucideHouse, 
      lucideBriefcase, 
      lucideShoppingBag, 
      lucideAlertTriangle, 
      lucideMapPin,
      lucidePencil,
      lucidePlus,
      lucideX,
      lucideInfo,
      lucideLayoutGrid,
      lucideBanknote
    }),
  ],
})
export class AddPropertyModal implements OnInit, OnDestroy {
  private propertyService     = inject(PropertyService);
  private propertyTypeService = inject(PropertyTypeService);
  private geoService          = inject(GeoService);
  private toast               = inject(ToastService);
  private readonly destroy$   = new Subject<void>();

  // Inputs
  editingProperty = input<PropertyModel | null>(null);
  structureId = input.required<number>();

  // Outputs
  closed = output<void>();
  saved = output<void>();

  // State
  saving = signal(false);
  propertyTypes = signal<PropertyTypeModel[]>([]);
  errors: Record<string, string> = {};
 
  // Geo Data
  countries    = signal<ICountry[]>([]);
  regions      = signal<IRegion[]>([]);
  villes       = signal<IVille[]>([]);
  communes     = signal<ICommune[]>([]);
  quartiers    = signal<IQuartier[]>([]);
  squareAreas  = signal<ISquareArea[]>([]);
  adresses     = signal<IAdresse[]>([]);

  // Selected IDs pour les selects
  selectedCountryId    = signal<number | null>(null);
  selectedRegionId     = signal<number | null>(null);
  selectedVilleId      = signal<number | null>(null);
  selectedCommuneId    = signal<number | null>(null);
  selectedQuartierId   = signal<number | null>(null);
  selectedSquareAreaId = signal<number | null>(null);

  // Status options
  statusOptions = [
    { value: PropertyStatusEnum.AVAILABLE, label: 'Disponible' },
    { value: PropertyStatusEnum.FOR_SALE, label: 'En vente' },
    { value: PropertyStatusEnum.FOR_RENT, label: 'À louer' },
    { value: PropertyStatusEnum.RENTED, label: 'Loué' },
    { value: PropertyStatusEnum.SOLD, label: 'Vendu' },
    { value: PropertyStatusEnum.UNDER_RENOVATION, label: 'En travaux' },
  ];

  // Form model en signal avec typage explicite
  form = signal<PropertyForm>({
    name: '',
    code: null,
    property_type_id: '',
    status: '',
    square_area_id: null,
    repere: null,
    latitude: null,
    longitude: null,
    what3words: null,
    total_surface: null,
    total_floors: null,
    sale_price: null,
    condo_fees: null,
    has_units: false,
    is_active: true,
    description: null,
    cover_image: null,
    cover_image_preview: null,
    amenities: '',
  });

  ngOnInit(): void {
    this.loadPropertyTypes();
    const property = this.editingProperty();
    if (property) {
      this.form.set({
        name: property.name,
        code: property.code,
        property_type_id: String(property.property_type.id),
        status: property.status,
        square_area_id: property.adresse?.square_area_id ?? null,
        repere: property.adresse?.repere ?? null,
        latitude: property.adresse?.latitude ?? null,
        longitude: property.adresse?.longitude ?? null,
        what3words: property.adresse?.what3words ?? null,
        total_surface: property.total_surface,
        total_floors: property.total_floors,
        sale_price: property.sale_price,
        condo_fees: property.condo_fees,
        has_units: property.has_units,
        is_active: property.is_active,
        description: property.description,
        cover_image: null,
        cover_image_preview: property.cover_image,
        amenities: property.amenities ? JSON.stringify(property.amenities, null, 2) : '',
      });
      // Pré-remplissage de la géo-localisation
      if (property.adresse) {
        this.selectedCountryId.set(property.adresse.square_area?.quartier?.commune?.ville?.region?.country_id ?? null);
        this.selectedRegionId.set(property.adresse.square_area?.quartier?.commune?.ville?.region_id ?? null);
        this.selectedVilleId.set(property.adresse.square_area?.quartier?.commune?.ville_id ?? null);
        this.selectedCommuneId.set(property.adresse.square_area?.quartier?.commune_id ?? null);
        this.selectedQuartierId.set(property.adresse.square_area?.quartier_id ?? null);
        this.selectedSquareAreaId.set(property.adresse.square_area_id ?? null);
        this.preloadGeoData();
      }
    }
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPropertyTypes(): void {
    this.propertyTypeService.findAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => this.propertyTypes.set(response.data),
      error: () => this.toast.error('Impossible de charger les types de bien.'),
    });
  }

  // ── GEO LOADERS ──────────────────────────────────────────────────

  loadCountries(): void {
    this.geoService.getCountries().pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp) => this.countries.set(resp.data),
    });
  }

  onCountryChange(event: any): void {
    const id = Number(event.target.value);
    this.selectedCountryId.set(id);
    this.selectedRegionId.set(null);
    this.clearGeoDown(0);
    if (id) {
      this.geoService.getRegions(id).subscribe(resp => this.regions.set(resp.data));
    }
  }

  onRegionChange(event: any): void {
    const id = Number(event.target.value);
    this.selectedRegionId.set(id);
    this.selectedVilleId.set(null);
    this.clearGeoDown(1);
    if (id) {
      this.geoService.getVilles(id).subscribe(resp => this.villes.set(resp.data));
    }
  }

  onVilleChange(event: any): void {
    const id = Number(event.target.value);
    this.selectedVilleId.set(id);
    this.selectedCommuneId.set(null);
    this.clearGeoDown(2);
    if (id) {
      this.geoService.getCommunes(id).subscribe(resp => this.communes.set(resp.data));
    }
  }

  onCommuneChange(event: any): void {
    const id = Number(event.target.value);
    this.selectedCommuneId.set(id);
    this.selectedQuartierId.set(null);
    this.clearGeoDown(3);
    if (id) {
      this.geoService.getQuartiers(id).subscribe(resp => this.quartiers.set(resp.data));
    }
  }

  onQuartierChange(event: any): void {
    const id = Number(event.target.value);
    this.selectedQuartierId.set(id);
    this.selectedSquareAreaId.set(null);
    this.clearGeoDown(4);
    if (id) {
      this.geoService.getSquareAreas(id).subscribe(resp => this.squareAreas.set(resp.data));
    }
  }

  onSquareAreaChange(event: any): void {
    const id = Number(event.target.value);
    this.selectedSquareAreaId.set(id);
    this.form.update(f => ({ ...f, square_area_id: id || null }));
  }

  private clearGeoDown(level: number): void {
    if (level <= 0) this.regions.set([]);
    if (level <= 1) this.villes.set([]);
    if (level <= 2) this.communes.set([]);
    if (level <= 3) this.quartiers.set([]);
    if (level <= 4) this.squareAreas.set([]);
    
    // Reset form field for square area
    if (level <= 4) {
      this.form.update(f => ({ ...f, square_area_id: null }));
    }
  }

  private preloadGeoData(): void {
    const ctryId = this.selectedCountryId();
    const rId = this.selectedRegionId();
    const vId = this.selectedVilleId();
    const cId = this.selectedCommuneId();
    const qId = this.selectedQuartierId();
    const sId = this.selectedSquareAreaId();

    if (ctryId) this.geoService.getRegions(ctryId).subscribe(resp => this.regions.set(resp.data));
    if (rId) this.geoService.getVilles(rId).subscribe(resp => this.villes.set(resp.data));
    if (vId) this.geoService.getCommunes(vId).subscribe(resp => this.communes.set(resp.data));
    if (cId) this.geoService.getQuartiers(cId).subscribe(resp => this.quartiers.set(resp.data));
    if (qId) this.geoService.getSquareAreas(qId).subscribe(resp => this.squareAreas.set(resp.data));
  }

  onCoverImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.form.update((f) => ({
        ...f,
        cover_image: file,
      }));

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.form.update((f) => ({
          ...f,
          cover_image_preview: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  validate(): boolean {
    this.errors = {};
    const current = this.form();

    if (!current.name?.trim()) {
      this.errors['name'] = 'Le nom du bien est requis';
    }

    if (!current.property_type_id) {
      this.errors['property_type_id'] = 'Le type de bien est requis';
    }

    if (!current.status) {
      this.errors['status'] = 'Le statut est requis';
    }

    if (!current.square_area_id) {
      this.errors['square_area_id'] = "Le carré/zone est requis";
    }

    if (!current.repere?.trim()) {
      this.errors['repere'] = "Le point de repère est requis";
    }

    return Object.keys(this.errors).length === 0;
  }

  save(): void {
    if (!this.validate()) return;

    this.saving.set(true);
    const current = this.form();

    const payload = {
      structure_id: this.structureId(),
      name: current.name,
      code: current.code,
      property_type_id: current.property_type_id,
      status: current.status,
      square_area_id: current.square_area_id,
      repere: current.repere,
      latitude: current.latitude,
      longitude: current.longitude,
      what3words: current.what3words,
      total_surface: current.total_surface,
      total_floors: current.total_floors,
      sale_price: current.sale_price,
      condo_fees: current.condo_fees,
      has_units: current.has_units,
      is_active: current.is_active,
      description: current.description,
      amenities:
        Array.isArray(current.amenities) && current.amenities.length > 0 ? current.amenities : null,
      ...(current.cover_image instanceof File ? { cover_image: current.cover_image } : {}),
    };

    const editingProperty = this.editingProperty();
    const request = editingProperty
      ? this.propertyService.update({ id: editingProperty.id, ...payload } as unknown as import('../../../interfaces/update-property-payload.interface').UpdatePropertyPayload)
      : this.propertyService.create(payload as unknown as CreatePropertyPayload);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toast.success(editingProperty ? 'Bien mis à jour avec succès.' : 'Bien créé avec succès.');
        this.saved.emit();
        this.closeModal();
      },
      error: (err) => {
        if (err.error?.errors) {
          this.errors = err.error.errors;
        }
        this.toast.error(err?.error?.message ?? 'Erreur lors de la sauvegarde.');
        this.saving.set(false);
      },
    });
  }

  closeModal(): void {
    this.closed.emit();
  }
}
