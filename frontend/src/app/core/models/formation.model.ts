export interface Formation {
  id?: number;
  titre: string;
  description: string;
  categorie: string;
  prix: number;
  active: boolean;
  dateCreation?: string;
}

export interface Page<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
