export type User = {
  stripeId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  avatar: string;
};

export type QueryParams = {
  orderBy?: string;
  order?: string;
  filterName?: string;
  filterAuthor?: string;
  limit?: number;
  offset?: number;
};
