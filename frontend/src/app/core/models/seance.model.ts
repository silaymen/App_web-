export interface Seance {
  id?: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  enseignant: string;
  matiere: string;
  classe: string;
  salle: string;
  typeSeance: string;
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
