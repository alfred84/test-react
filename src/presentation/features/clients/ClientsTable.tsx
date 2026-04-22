import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles, type Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import type { FC } from 'react';

import type { ClientSummary } from '@domain/entities/Client';

export interface ClientsTableProps {
  readonly items: readonly ClientSummary[];
  readonly loading?: boolean;
  readonly deletingId?: string | null;
  readonly emptyMessage?: string;
  readonly onEdit: (client: ClientSummary) => void;
  readonly onDelete: (client: ClientSummary) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(0.5),
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  empty: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
}));

export const ClientsTable: FC<ClientsTableProps> = ({
  items,
  loading = false,
  deletingId = null,
  emptyMessage = 'No se encontraron clientes con los filtros aplicados.',
  onEdit,
  onDelete,
}) => {
  const classes = useStyles();
  const hasItems = items.length > 0;

  return (
    <Paper className={classes.root} elevation={1}>
      {loading ? (
        <Box className={classes.overlay} data-testid="clients-table-loading">
          <CircularProgress />
        </Box>
      ) : null}

      <TableContainer>
        <Table aria-label="Lista de clientes" data-testid="clients-table">
          <TableHead>
            <TableRow>
              <TableCell>Identificación</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellidos</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hasItems ? (
              items.map((client) => {
                const isRowDeleting = deletingId === client.id;
                return (
                  <TableRow key={client.id} hover data-testid={`client-row-${client.id}`}>
                    <TableCell>{client.identification}</TableCell>
                    <TableCell>{client.firstName}</TableCell>
                    <TableCell>{client.lastName}</TableCell>
                    <TableCell align="right">
                      <Box className={classes.actions}>
                        <Tooltip title="Editar">
                          <span>
                            <IconButton
                              aria-label={`Editar ${client.firstName}`}
                              onClick={(): void => onEdit(client)}
                              data-testid={`client-edit-${client.id}`}
                            >
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <span>
                            <IconButton
                              aria-label={`Eliminar ${client.firstName}`}
                              onClick={(): void => onDelete(client)}
                              disabled={isRowDeleting}
                              data-testid={`client-delete-${client.id}`}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box className={classes.empty} data-testid="clients-table-empty">
                    <Typography variant="body2" color="textSecondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
