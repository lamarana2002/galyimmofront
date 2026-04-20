import { TestimonialModel } from '../models/testimonial.model';

export interface CreateTestimonialPayload {
  name: string;
  role?: string | null;
  content: string;
  note?: number;
  image?: string | null;
  is_visible?: boolean;
  position?: number;
}

export interface UpdateTestimonialPayload extends CreateTestimonialPayload {
  id: number;
}

export const emptyTestimonialForm = (): CreateTestimonialPayload => ({
  name: '',
  role: '',
  content: '',
  note: 5,
  image: '',
  is_visible: true,
  position: 0,
});

export const testimonialToUpdatePayload = (testimonial: TestimonialModel): UpdateTestimonialPayload => ({
  id: testimonial.id,
  name: testimonial.name,
  role: testimonial.role,
  content: testimonial.content,
  note: testimonial.note,
  image: testimonial.image,
  is_visible: testimonial.is_visible,
  position: testimonial.position,
});
