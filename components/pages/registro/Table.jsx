import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {
  CloudDone as OnlineIcon,
  OfflinePin as OfflineIcon,
} from "@material-ui/icons";
import { months } from "../../../lib/date/lang.js";
import { parseStandardNumber } from "../../../lib/date/mod.js";

import TableHeaders from "./Table/Header.jsx";
import TableFooter from "./Table/Footer.jsx";

const parseStandardNumberAsWeek = (standard_date) => {
  const date = parseStandardNumber(standard_date);

  if (date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const month_string = month < 10
      ? months.get(`0${month}`)
      : months.get(String(month));

    return `Semana del ${day} de ${month_string}`;
  } else {
    return "La fecha proporcionada por el sistema no es válida";
  }
};

const columns = [
  { id: "client", label: "Cliente", orderable: true },
  { id: "project", label: "Proyecto", orderable: true },
  { id: "role", label: "Rol", orderable: true },
  { id: "expected_hours", label: "Horas asignadas", orderable: true },
  { id: "used_hours", label: "Horas ejecutadas", orderable: false },
];

const useStyles = makeStyles((theme) => ({
  button_online: {
    color: theme.palette.success.main,
  },
  menu: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.text.primary,
    flexGrow: 1,
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  root: {
    width: "100%",
  },
  table: {
    minWidth: 750,
  },
}));

export default function RegistryTable({
  data,
  footer,
  onButtonClick,
  onRowSave,
  onRowUpdate,
  week_details,
}) {
  const classes = useStyles();

  const [orderBy, setOrderBy] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const updateSortingDirection = (column) => {
    switch (orderBy?.[column]) {
      case "asc":
        setOrderBy((prev_state) => ({ ...prev_state, [column]: "desc" }));
        break;
      case "desc":
        setOrderBy((prev_state) => {
          delete prev_state[column];
          return { ...prev_state };
        });
        break;
      default:
        setOrderBy((prev_state) => ({ ...prev_state, [column]: "asc" }));
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const emptyRows = rowsPerPage - data.size;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <AppBar className={classes.menu} position="static">
          <Toolbar>
            <Grid container alignItems="center">
              <Grid container item xs={6} justify="flex-start">
                <div>
                  <Typography variant="h5">
                    {week_details.date
                      ? parseStandardNumberAsWeek(week_details.date)
                      : "Semana no disponible"}
                  </Typography>
                  <Typography variant="subtitle2">
                    Horas totales de la semana: {week_details.expected_hours ||
                      0}
                  </Typography>
                  <Typography variant="subtitle2">
                    Horas asignadas: {week_details.assignated_hours || 0}
                  </Typography>
                  <Typography variant="subtitle2">
                    Horas registradas: {week_details.executed_hours || 0}
                  </Typography>
                  <Typography variant="subtitle2">
                    Horas solicitadas pendientes:
                    {week_details.requested_hours || 0}
                  </Typography>
                </div>
              </Grid>
              <Grid container item xs={6} justify="flex-end">
                <Button
                  onClick={onButtonClick}
                  variant="contained"
                >
                  Solicitar horas
                </Button>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
          >
            <TableHeaders
              classes={classes}
              columns={columns}
              orderBy={orderBy}
              updateSortingDirection={updateSortingDirection}
            />
            <TableBody>
              {Array.from(data.values())
                .filter((_r, index) => {
                  const start = rowsPerPage * page;
                  const end = start + rowsPerPage - 1;
                  return index >= start && index <= end;
                })
                .sort((a, b) => {
                  for (const column in orderBy) {
                    let result = -1;
                    if (orderBy[column] === "desc") result = 1;

                    if (typeof a[column] === "string") {
                      const comparison = a[column].localeCompare(b[column]);
                      if (comparison === 0) continue;
                      return comparison === -1 ? result : result * -1;
                    } else {
                      if (a[column] === b[column]) continue;
                      return a[column] < b[column] ? result : result * -1;
                    }
                  }
                  return 0;
                })
                .map((row, index) => (
                  <TableRow
                    tabIndex={-1}
                    key={index}
                  >
                    {Object.entries(row)
                      .filter(([column]) =>
                        columns.findIndex(({ id }) => id === column) !== -1 &&
                        column !== "used_hours"
                      )
                      .sort(([a], [b]) =>
                        columns.findIndex(({ id }) => id === a) <
                            columns.findIndex(({ id }) => id === b)
                          ? -1
                          : 1
                      )
                      .map(([index, value]) => (
                        <TableCell key={index}>{value}</TableCell>
                      ))}
                    <TableCell>
                      <TextField
                        error={Number(row.expected_hours) <
                          Number(row.used_hours)}
                        helperText={Number(row.expected_hours) <
                            Number(row.used_hours) &&
                          "Las horas usadas exceden las asignadas"}
                        onChange={(event) =>
                          onRowUpdate(
                            `${row.budget_id}_${row.role_id}`,
                            event.target.value,
                          )}
                        style={{ width: "150px" }}
                        value={row.used_hours || ""}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="Guardar"
                        onClick={() => onRowSave(row)}
                      >
                        {row.server_updated
                          ? <OnlineIcon className={classes.button_online} />
                          : <OfflineIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {!!emptyRows &&
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>}
            </TableBody>
          </Table>
          <TableFooter
            length_options={[1, 5, 10, 25]}
            onChangeSelectedPage={handleChangePage}
            onChangePageLength={handleChangeRowsPerPage}
            page_length={rowsPerPage}
            selected_page={page}
            total_count={data.size}
          >
            {footer}
          </TableFooter>
        </TableContainer>
      </Paper>
    </div>
  );
}
