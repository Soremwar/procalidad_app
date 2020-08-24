import React, {
  useState,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import {
  Cancel as RejectIcon,
  CheckCircle as ConfirmIcon,
} from "@material-ui/icons";

import TableHeaders from "./components/Header.jsx";
import TableFooter from "./components/Footer.jsx";

const columns = [
  { id: "person", label: "Recurso", orderable: true },
  { id: "project", label: "Proyecto", orderable: true },
  { id: "role", label: "Rol", orderable: true },
  { id: "date", label: "Fecha", orderable: true },
  { id: "hours", label: "Horas solicitadas", orderable: true },
  { id: "description", label: "Descripcion", orderable: false },
];

const useStyles = makeStyles((theme) => ({
  button_approve: {
    color: theme.palette.success.main,
  },
  button_reject: {
    color: theme.palette.error.main,
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

export default function ({
  data,
  onUpdateRequest,
  search = {},
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
              {data
                .filter((row) => {
                  for (const column in search) {
                    if (row[column] && search[column]) {
                      if (search[column] == row[column]) {
                        continue;
                      } else {
                        return false;
                      }
                    }
                  }
                  return true;
                })
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
                      <IconButton
                        aria-label="Aceptar"
                        onClick={() => onUpdateRequest(row.id, true)}
                      >
                        <ConfirmIcon className={classes.button_approve} />
                      </IconButton>
                      <IconButton
                        aria-label="Rechazar"
                        onClick={() => onUpdateRequest(row.id, false)}
                      >
                        <RejectIcon className={classes.button_reject} />
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
            total_count={data.length}
          />
        </TableContainer>
      </Paper>
    </div>
  );
}
