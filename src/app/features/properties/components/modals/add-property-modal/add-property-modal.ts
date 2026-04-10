import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { PropertyService } from '../../../services/property.service';
import { PropertyTypeService } from '../../../services/property-type.service';
import { ProperttyStatusEnum } from '../../../enums/property-status.enum';
import { PropertyTypeModel } from '../../../models/propety-type.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import {
  lucideBriefcase,
  lucideHouse,
  lucideImage,
  lucideSave,
  lucideShoppingBag,
} from '@ng-icons/lucide';
import { ProfileService } from '../../../../../core/auth/services/profile.service';
import { Router } from '@angular/router';

interface PropertyForm {
  name: string;
  code: string | null;
  property_type_id: string;
  status: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
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
    provideIcons({ lucideImage, lucideSave, lucideHouse, lucideBriefcase, lucideShoppingBag }),
  ],
})
export class AddPropertyModal implements OnInit {
  private propertyService = inject(PropertyService);
  private propertyTypeService = inject(PropertyTypeService);

  // Inputs
  editingId = input<number | null>(null);
  structureId = input.required<number>();

  // Outputs
  closed = output<void>();
  saved = output<void>();

  // State
  saving = signal(false);
  propertyTypes = signal<PropertyTypeModel[]>([]);
  errors: Record<string, string> = {};

  // Status options
  statusOptions = [
    { value: ProperttyStatusEnum.AVAILABLE, label: 'Disponible' },
    { value: ProperttyStatusEnum.FOR_SALE, label: 'En vente' },
    { value: ProperttyStatusEnum.FOR_RENT, label: 'À louer' },
    { value: ProperttyStatusEnum.RENTED, label: 'Loué' },
    { value: ProperttyStatusEnum.SOLD, label: 'Vendu' },
    { value: ProperttyStatusEnum.UNDER_RENOVATION, label: 'En travaux' },
  ];

  // Form model en signal avec typage explicite
  form = signal<PropertyForm>({
    name: '',
    code: null,
    property_type_id: '',
    status: '',
    address: null,
    city: null,
    postal_code: null,
    country: "Côte d'Ivoire",
    latitude: null,
    longitude: null,
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
    console.log(this.editingId());

    this.loadPropertyTypes();
    if (this.editingId()) {
      this.loadProperty();
    }
  }

  loadPropertyTypes(): void {
    this.propertyTypeService.findAll().subscribe({
      next: (types) => this.propertyTypes.set(types),
      error: (err) => console.error('Erreur chargement types', err),
    });
  }

  loadProperty(): void {
    this.propertyService.findById(this.editingId()!).subscribe({
      next: (response) => {
        const property = response.data;
        this.form.set({
          name: property.name,
          code: property.code,
          property_type_id: String(property.property_type.id), // Convertir en string si nécessaire
          status: property.status,
          address: property.address,
          city: property.city,
          postal_code: property.postal_code,
          country: property.country || "Côte d'Ivoire",
          latitude: property.latitude,
          longitude: property.longitude,
          total_surface: property.total_surface,
          total_floors: property.total_floors,
          sale_price: property.sale_price,
          condo_fees: property.condo_fees,
          has_units: property.has_units,
          is_active: property.is_active,
          description: property.description,
          cover_image: null, // On ne peut pas récupérer le File depuis l'API
          cover_image_preview: property.cover_image, // <- Maintenant c'est autorisé (string | null)
          amenities: property.amenities ? JSON.stringify(property.amenities, null, 2) : '',
        });
      },
      error: (err) => console.error('Erreur chargement bien', err),
    });
  }

  onCoverImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.form.update((f) => ({
        ...f,
        cover_image: file,
      }));

      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.update((f) => ({
          ...f,
          cover_image_preview: e.target.result, // <- Maintenant c'est autorisé (string)
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

    return Object.keys(this.errors).length === 0;
  }

  save(): void {
    if (!this.validate()) return;

    this.saving.set(true);
    const current = this.form();

    const payload: any = {
      structure_id: this.structureId(),
      name: current.name,
      code: current.code,
      property_type_id: current.property_type_id,
      status: current.status,
      address: current.address,
      city: current.city,
      postal_code: current.postal_code,
      country: current.country,
      latitude: current.latitude,
      longitude: current.longitude,
      total_surface: current.total_surface,
      total_floors: current.total_floors,
      sale_price: current.sale_price,
      condo_fees: current.condo_fees,
      has_units: current.has_units,
      is_active: current.is_active,
      description: current.description,
      amenities:
        Array.isArray(current.amenities) && current.amenities.length > 0 ? current.amenities : null,
    };

    if (current.cover_image instanceof File) {
      payload.cover_image = current.cover_image;
    }

    const request = this.editingId()
      ? this.propertyService.update({ id: this.editingId()!, ...payload })
      : this.propertyService.create(payload);

    request.subscribe({
      next: () => {
        this.saved.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erreur sauvegarde', err);
        if (err.error?.errors) {
          this.errors = err.error.errors;
        }
        this.saving.set(false);
      },
    });
  }

  closeModal(): void {
    this.closed.emit();
  }
}
