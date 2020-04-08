import React, {
  useEffect,
  useState
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow
} from "@material-ui/core";

import TableHeaders from "./components/Header.jsx";
import TableMenu from "./components/Menu.jsx";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

//TODO
//Manage errors in front table
const getTableData = async (
  source,
  order,
  page,
  rows,
  search,
  error_callback = () => {},
) => {
  return await fetch(source, {
    method: "POST",
    body: JSON.stringify({ order, page, rows, search }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((x) => x.json())
    .catch(() => error_callback([]));
};

export default function AsyncTable({
  data_index,
  data_source,
  headers,
  onAddClick,
  onEditClick,
  onDeleteClick,
  tableShouldUpdate,
  title,
  setTableShouldUpdate,
}) {
  const classes = useStyles();
  const [orderBy, setOrderBy] = React.useState({});
  const [selected, setSelected] = React.useState(new Set());
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = useState([]);

  const updateSortingDirection = (column) => {
    switch (orderBy?.[column]) {
      case "asc":
        setOrderBy((prev_state) => ({ ...prev_state, [column]: "desc" }));
        setTableShouldUpdate(true);
        break;
      case "desc":
        setOrderBy((prev_state) => {
          delete prev_state[column];
          return { ...prev_state };
        });
        break;
      default:
        setOrderBy((prev_state) => ({ ...prev_state, [column]: "asc" }));
        setTableShouldUpdate(true);
    }
  };

  const selectAllItems = (event) => {
    if (event.target.checked) {
      const indexes = rows.map((row) => Number(row.id));
      setSelected(new Set(indexes));
    } else {
      setSelected(new Set());
    }
  };

  const selectItem = (event, selected_item) => {
    const item_index = Number(selected_item);
    const should_add_item = event.target.checked;
    setSelected((prev_state) => {
      should_add_item
        ? prev_state.add(item_index)
        : prev_state.delete(item_index);
      return new Set(prev_state);
    });
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    setTableShouldUpdate(true);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setTableShouldUpdate(true);
  };

  const emptyRows = rowsPerPage -
    Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  //TODO
  //Add error callback handling
  //Add async load (non overlapping handling)
  //Show visual load of data
  useEffect(() => {
    setTableShouldUpdate(false);
    if (tableShouldUpdate) {
      getTableData(
        data_source,
        orderBy,
        page,
        rowsPerPage,
        "",
      ).then((data) => {
        let new_selected = new Set();
        data.forEach(({ id }) => {
          selected.has(id) && new_selected.add(id);
        });
        setRows(data);
        setSelected(new_selected);
      });
    }
  }, [tableShouldUpdate, orderBy, page, rowsPerPage]);

  const isItemSelected = (item) => {
    const index = Number(item);
    return selected.has(index);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableMenu
          numSelected={selected.size}
          onAddClick={onAddClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          selected={selected}
          title={title}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
          >
            <TableHeaders
              classes={classes}
              headers={headers}
              numSelected={selected.size}
              onSelectAllClick={selectAllItems}
              orderBy={orderBy}
              rowCount={rows.length}
              updateSortingDirection={updateSortingDirection}
            />
            {//TODO
            //Replace limiter for the page size for actual paginator
            //Replace order in client side by order in server side
            }
            <TableBody>
              {rows
                .map((row) => {
                  const index = row.id;
                  const is_item_selected = isItemSelected(index);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => selectItem(event, index)}
                      role="checkbox"
                      aria-checked={is_item_selected}
                      tabIndex={-1}
                      key={index}
                      selected={is_item_selected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={is_item_selected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      {Object.entries(headers).map(([_, column]) => {
                        return (<TableCell key={column.id}>
                          {row[column.id]}
                        </TableCell>);
                      })}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 &&
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        {/*
          TODO
          Get page total number from server
        */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
