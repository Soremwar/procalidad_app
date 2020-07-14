import React, {
  useState,
} from "react";
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
import {
  months,
} from "../../../lib/date/lang.js";

import TableHeaders from "./components/Header.jsx";
import TableFooter from "./components/Footer.jsx";

const parseDateAsWeek = (date) => {
  const day = date.getDate();
  const month = date.getMonth();
  const month_string = month < 10
    ? months.get(`0${month}`)
    : months.get(String(month));

  return `Semana del ${day} de ${month_string}`;
};

const columns = [
  { id: "client", label: "Cliente", orderable: true },
  { id: "project", label: "Proyecto", orderable: true },
  { id: "expected_hours", label: "Horas asignadas", orderable: true },
  { id: "used_hours", label: "Horas ejecutadas", orderable: false },
];

const useStyles = makeStyles((theme) => ({
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

export default function ({
  data,
  onRowSave,
  onRowUpdate,
  week,
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

  const emptyRows = rowsPerPage - data.length;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <AppBar className={classes.menu} position="static">
          <Toolbar>
            <Grid container alignItems="center">
              <Grid container item xs={6} justify="flex-start">
                <Typography>
                  {week ? parseDateAsWeek(week) : "Semana no disponible"}
                </Typography>
              </Grid>
              <Grid container item xs={6} justify="flex-end">
                <Button variant="contained">Solicitar horas</Button>
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
                        onChange={(event) =>
                          onRowUpdate(row.budget_id, event.target.value)}
                        style={{ width: "150px" }}
                        value={row.used_hours || ""}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="Guardar"
                        onClick={() => onRowSave(row)}
                      >
                        {row.server_updated ? <OnlineIcon /> : <OfflineIcon />}
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
          />
        </TableContainer>
      </Paper>
    </div>
  );
}
