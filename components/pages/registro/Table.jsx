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

const base_columns = [
  { id: "client", label: "Cliente", orderable: true },
  { id: "project", label: "Proyecto", orderable: true },
  { id: "role", label: "Rol", orderable: true },
  { id: "expected_hours", label: "Horas asignadas", orderable: true },
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
  edit_mode,
  header,
  footer,
  onHourChange,
  onReasonChange,
  week_details,
}) {
  const classes = useStyles();

  let columns = [
    ...base_columns,
    {
      id: "used_hours",
      label: "Horas ejecutadas",
      orderable: false,
      displayAs: (value, index, row) => (
        <TableCell>
          <TextField
            fullWidth
            error={Number(row.expected_hours) <
              Number(row.used_hours)}
            helperText={Number(row.expected_hours) <
                Number(row.used_hours) &&
              "Las horas usadas exceden las asignadas"}
            onChange={(event) => {
              const value = event.target.value === ""
                ? ""
                : parseInt(event.target.value) || 0;
              onHourChange(
                `${row.budget_id}_${row.role_id}`,
                value,
              );
            }}
            style={{ maxWidth: "250px" }}
            value={row.used_hours}
          />
        </TableCell>
      ),
    },
  ];
  if (edit_mode) {
    columns.push(
      {
        id: "reason",
        label: "Justificación",
        orderable: false,
        displayAs: (value, index, row) => (
          <TableCell>
            <TextField
              error={!row.reason}
              fullWidth
              helperText={!row.reason &&
                "Especifique una justificación para el cambio"}
              inputProps={{
                maxLength: "100",
              }}
              multiline
              onChange={(event) =>
                onReasonChange(
                  `${row.budget_id}_${row.role_id}`,
                  event.target.value,
                )}
              style={{ maxWidth: "400px" }}
              value={row.reason}
            />
          </TableCell>
        ),
      },
    );
  }

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
                {!edit_mode && (
                  <div>
                    <Typography variant="h5">
                      {week_details.date
                        ? parseStandardNumberAsWeek(week_details.date)
                        : "Semana no disponible"}
                    </Typography>
                    <Typography variant="subtitle2">
                      Horas totales de la semana:
                      {week_details.expected_hours ||
                        0}
                    </Typography>
                    <Typography variant="subtitle2">
                      Horas asignadas: {week_details.assignated_hours || 0}
                    </Typography>
                    <Typography variant="subtitle2">
                      Horas solicitadas:
                      {week_details.requested_hours || 0}
                    </Typography>
                    <Typography variant="subtitle2">
                      Horas asignadas + solicitadas:
                      {Number(week_details.assignated_hours || 0) +
                        Number(week_details.requested_hours || 0)}
                    </Typography>
                  </div>
                )}
              </Grid>
              <Grid container item xs={6}>{header}</Grid>
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
              edit_mode={edit_mode}
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
                      .filter(([key]) => {
                        return columns.findIndex(({ id }) => id === key) !== -1;
                      })
                      .sort(([a], [b]) =>
                        columns.findIndex(({ id }) => id === a) <
                            columns.findIndex(({ id }) => id === b)
                          ? -1
                          : 1
                      )
                      .map(([index, value]) => {
                        const column = columns.find(({ id }) => id === index);
                        if (column.displayAs) {
                          return column.displayAs(value, index, row);
                        }
                        return <TableCell key={index}>{value}</TableCell>;
                      })}
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
