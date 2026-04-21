export type Gender = 'M' | 'F';

export interface Client {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly identification: string;
  readonly mobilePhone: string;
  readonly otherPhone: string;
  readonly address: string;
  readonly birthDate: string;
  readonly affiliationDate: string;
  readonly gender: Gender;
  readonly personalReview: string;
  readonly image: string | null;
  readonly interestId: string;
}

export interface ClientSummary {
  readonly id: string;
  readonly identification: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface ClientFilters {
  readonly identification?: string;
  readonly name?: string;
}

export type ClientDraft = Omit<Client, 'id'>;

export const getClientFullName = (client: Pick<Client, 'firstName' | 'lastName'>): string =>
  `${client.firstName} ${client.lastName}`.trim();
