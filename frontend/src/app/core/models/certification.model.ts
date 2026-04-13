export interface Certification {
  id?: number;
  name: string;
  description?: string;
  version?: string;
  validityDays?: number;
  issueDate?: string;
  expiryDate?: string;
  ownerEmail?: string;
}
