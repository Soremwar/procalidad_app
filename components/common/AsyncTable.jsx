import React, { useEffect, useState } from "react";
import { lighten, makeStyles } from "@material-ui/core/styles";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography
} from "@material-ui/core";
import {
  AddBox as AddIcon,
  Create as EditICon,
  Delete as DeleteIcon
} from "@material-ui/icons";

const useTitleStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight: theme.palette.type === "light"
    ? {
      color: theme.palette.secondary.main,
      backgroundColor: lighten(theme.palette.secondary.light, 0.85),
    }
    : {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.secondary.dark,
    },
  title: {
    flex: "1 1 100%",
  },
})
);

const TableTitle = ({
  numSelected,
  onAddClick,
  onEditClick,
  onDeleteClick,
  selected,
  title,
}) => {
  const classes = useTitleStyles();

  return (
    <Toolbar
      className={[
        classes.root,
        ...(numSelected > 0 ? [classes.highlight] : []),
      ].join(" ")}
    >
      {numSelected > 0
        ? (
          <Typography className={classes.title} color="inherit"
            variant="subtitle1"
          >
            {numSelected} seleccionados
          </Typography>
        )
        : (
          <Typography className={classes.title} variant="h6" id="tableTitle">
            {title}
          </Typography>
        )}

      <Tooltip title="Agregar">
        <IconButton aria-label="add" onClick={onAddClick}>
          <AddIcon />
        </IconButton>
      </Tooltip>

      {numSelected == 1 &&
        (
          <Tooltip title="Editar">
            <IconButton aria-label="edit" onClick={() =>
              onEditClick(Array.from(selected)[0])}
            >
              <EditICon />
            </IconButton>
          </Tooltip>
        )}

      {numSelected > 0 &&
        (
          <Tooltip title="Eliminar">
            <IconButton aria-label="delete" onClick={() =>
              onDeleteClick(Array.from(selected))}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
    </Toolbar>
  );
};

export const Header = ({
  classes,
  headers,
  numSelected,
  onSelectAllClick,
  orderBy,
  rowCount,
  updateSortingDirection,
}) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "Seleccionar Todo" }}
          />
        </TableCell>
        {headers.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy?.[headCell.id] || false}
          >
            <TableSortLabel
              active={orderBy?.[headCell.id] && true}
              direction={orderBy?.[headCell.id] || "asc"}
              onClick={(_) => updateSortingDirection(headCell.id)}
              hideSortIcon={true}
            >
              {headCell.label}
              {orderBy?.[headCell.id] &&
                <span className={classes.visuallyHidden}>
                  {orderBy?.[headCell.id] === "asc"
                    ? "Ordenado Ascendentemente"
                    : "Ordenado Descentemente"}
                </span>}
            </TableSortLabel>
          </TableCell>
        )
        )}
      </TableRow>
    </TableHead>
  );
};

const useTableStyles = makeStyles((theme) => ({
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

export default function EnhancedTable({
  data_index,
  headers,
  onAddClick = () => {},
  onEditClick = () => {},
  onDeleteClick = () => {},
  retrieveData,
  title,
}) {
  const classes = useTableStyles();
  const [tableShouldUpdate, setTableShouldUpdate] = React.useState(true);
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
      const indexes = Object.entries(rows).map(([index]) => index);
      setSelected(new Set(indexes));
    } else {
      setSelected(new Set());
    }
  };

  const selectItem = (event, selectedIndex) => {
    const should_add_item = event.target.checked;
    setSelected((prev_state) => {
      should_add_item
        ? prev_state.add(selectedIndex)
        : prev_state.delete(selectedIndex);
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

  useEffect(() => {
    setTableShouldUpdate(false);
    retrieveData(orderBy).then((data) => {
      //Remove data index from data for show on table
      for (const key in data) {
        delete data[key][data_index];
      }
      setRows((prev_state) => ({ ...prev_state, ...data }));
    });
  }, [tableShouldUpdate]);

  const isItemSelected = (index) => selected.has(index);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableTitle
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
            <Header
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
            //Add order per field
            //Handle page change
            }
            <TableBody>
              {Object.entries(rows)
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
