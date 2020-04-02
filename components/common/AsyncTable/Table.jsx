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
})
);

const getTableData = async (
  source,
  error_callback = () => {},
) => {
  return await fetch(source)
    .then((x) => x.json())
    .catch(error_callback);
};

const sortData = (data, order) => {
  return data.sort(([_a, a], [_b, b]) => {
    for (const column in order) {
      const a_data = String(a[column] ?? "").toLowerCase();
      const b_data = String(b[column] ?? "").toLowerCase();
      if (a_data !== b_data) {
        switch (order[column]) {
          case "asc":
            return a_data > b_data ? 1 : -1;
          case "desc":
            return a_data < b_data ? 1 : -1;
        }
      }
    }
  });
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
  const [rows, setRows] = useState({});

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

  const selectAllItems = (event) => {
    if (event.target.checked) {
      const indexes = Object.entries(rows).map(([index]) => Number(index));
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage -
    Math.min(rowsPerPage, Object.entries(rows).length - page * rowsPerPage);

  //TODO
  //Add error callback inhandling

  useEffect(() => {
    setTableShouldUpdate(false);
    if (tableShouldUpdate) {
      getTableData(data_source).then((data) => {
        //Remove data index from data for show on table
        let new_selected = new Set();
        for (const key in data) {
          let current_item = data[key][data_index];
          selected.has(current_item) && new_selected.add(current_item);
          delete data[key][data_index];
        }
        setRows(data);
        setSelected(new_selected);
      });
    }
  }, [tableShouldUpdate]);

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
              rowCount={Object.entries(rows).length}
              updateSortingDirection={updateSortingDirection}
            />
            {//TODO
            //Replace limiter for the page size for actual paginator
            //Replace order in client side by order in server side
            }
            <TableBody>
              {sortData(Object.entries(rows), orderBy)
                .slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage)
                .map(([index, row]) => {
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
                      {Object.entries(row).map(([_, column], index) => {
                        const column_props = index == 0
                          ? {
                            component: "th",
                            id: labelId,
                            scope: "row",
                            padding: "none",
                          }
                          : { align: "right" };
                        return <TableCell {...column_props} key={index}>
                          {column}
                        </TableCell>;
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={Object.entries(rows).length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
