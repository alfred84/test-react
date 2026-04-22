import type { FC } from 'react';
import { useParams } from 'react-router-dom';

export interface ClientEditPageParams {
  readonly id: string;
}

export const ClientEditPage: FC = () => {
  const { id } = useParams<ClientEditPageParams>();
  return (
    <main data-testid="client-edit-page">
      <h1>Editar cliente</h1>
      <p data-testid="client-edit-id">{id}</p>
    </main>
  );
};
