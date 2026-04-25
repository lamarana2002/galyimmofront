import { FaqModel } from '../models/faq.model';

export interface CreateFaqPayload {
  question: string;
  answer: string;
  is_visible?: boolean;
  position?: number;
}

export interface UpdateFaqPayload extends CreateFaqPayload {
  id: number;
}

export const emptyFaqForm = (): CreateFaqPayload => ({
  question: '',
  answer: '',
  is_visible: true,
  position: 0,
});

export const faqToUpdatePayload = (faq: FaqModel): UpdateFaqPayload => ({
  id: faq.id,
  question: faq.question,
  answer: faq.answer,
  is_visible: faq.is_visible,
  position: faq.position,
});
