export interface JobOffre {
  idJoboffer?: number;
  nameJoboffer: string;
  descriptionOffer: string;
  contratTypeoffer: string;
  offerSalary: string;
  offerDate: string;
  skillsOffer: string;
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
