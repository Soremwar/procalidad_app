import React, {
  useEffect,
  useState,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";

import { requestGenerator } from "../../../lib/api/request.js";
import { objectsAreEqual } from "../../../lib/utils/object.js";

import TableHeaders from "./components/Header.jsx";
import TableMenu from "./components/Menu.jsx";
import TableFooter from "./components/Footer.jsx";

const fetchApi = requestGenerator();

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
  filters,
  params,
) => {
  //Avoid overlapping of parameters specified in url query
  const url_params = Object.fromEntries(
    Object.entries(params).filter(([index]) =>
      !([
        "filters",
        "order",
        "page",
        "rows",
        "search",
      ].includes(index))
    ),
  );

  return fetchApi(source, {
    method: "POST",
    body: JSON.stringify({
      filters,
      order,
      page,
      rows,
      search,
      ...url_params,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((request) => {
      if (request.ok) {
        return request.json();
      } else {
        throw new Error("Fetching error");
      }
    });
};

const defaultCellDisplay = (value) => value;

export default function AsyncTable({
  columns,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onTableUpdate,
  search: custom_search = {},
  request_parameters = {},
  update_table,
  url: data_source,
}) {
  const classes = useStyles();

  const [filters, setFilters] = useState({});
  const [orderBy, setOrderBy] = useState({});
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [should_fetch_data, setShouldFetchData] = useState(false);
  const [source_params, setSourceParams] = useState({});
  const [source_url, setSourceURL] = useState("");
  const [total_count, setTotalCount] = useState(0);

  const updateSortingDirection = (column) => {
    switch (orderBy?.[column]) {
      case "asc":
        setOrderBy((prev_state) => ({ ...prev_state, [column]: "desc" }));
        setShouldFetchData(true);
        break;
      case "desc":
        setOrderBy((prev_state) => {
          delete prev_state[column];
          return { ...prev_state };
        });
        break;
      default:
        setOrderBy((prev_state) => ({ ...prev_state, [column]: "asc" }));
        setShouldFetchData(true);
    }
  };

  //Validation to avoid unnecessary fetching on same filters
  const updateCustomFilters = (raw_new_filters) => {
    const new_filters = Object.fromEntries(
      Object.entries(raw_new_filters).filter(([key, value]) =>
        String(key) && String(value)
      ),
    );
    if (!objectsAreEqual(new_filters, filters)) {
      setFilters(new_filters);
      setPage(0);
      setShouldFetchData(true);
    }
  };

  //Validation to avoid unnecessary fetching on same filters
  const updateSearchFilters = (new_search_params) => {
    if (!objectsAreEqual(new_search_params, search)) {
      setSearch(new_search_params);
      setPage(0);
      setShouldFetchData(true);
    }
  };

  const updateURLSource = (new_source) => {
    if (new_source !== source_url) {
      setSourceURL(new_source);
      setPage(0);
      setShouldFetchData(true);
    }
  };

  //Validation to avoid unnecessary fetching on same params
  const updateSourceParams = (params) => {
    if (!objectsAreEqual(params, source_params)) {
      setSourceParams(params);
      setPage(0);
      setShouldFetchData(true);
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
    setShouldFetchData(true);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setShouldFetchData(true);
  };

  const emptyRows = rowsPerPage - rows.length;

  //Initialize table
  useEffect(() => {
    setFilters(Object.fromEntries(
      Object.entries(custom_search).filter(([key, value]) =>
        String(key) && String(value)
      ),
    ));
    setSourceURL(data_source);
    setSourceParams(request_parameters);
  }, []);

  useEffect(() => {
    updateCustomFilters(custom_search);
  }, [custom_search]);

  useEffect(() => {
    updateURLSource(data_source);
  }, [data_source]);

  useEffect(() => {
    updateSourceParams(request_parameters);
  }, [request_parameters]);

  useEffect(() => {
    if (update_table) {
      setShouldFetchData(true);
    }
  }, [update_table]);

  //TODO
  //Add error callback handling
  //Add async load (non overlapping handling)
  //Show visual load of data
  useEffect(() => {
    setShouldFetchData(false);
    if (should_fetch_data && source_url) {
      getTableData(
        source_url,
        orderBy,
        page,
        rowsPerPage,
        search,
        filters,
        source_params,
      ).then(({ count, data }) => {
        let new_selected = new Set();
        data.forEach(({ id }) => {
          selected.has(id) && new_selected.add(id);
        });
        setRows(data);
        setSelected(new_selected);
        setTotalCount(count);
      }).catch(() => {
        setRows([]);
        setTotalCount(0);
      }).finally(() => {
        onTableUpdate();
      });
    }
  }, [should_fetch_data]);

  const isItemSelected = (item) => {
    const index = Number(item);
    return selected.has(index);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableMenu
          columns={columns}
          numSelected={selected.size}
          onAddClick={onAddClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onFilterChange={updateSearchFilters}
          selected={selected}
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
              headers={columns}
              numSelected={selected.size}
              onSelectAllClick={selectAllItems}
              orderBy={orderBy}
              rowCount={rows.length}
              updateSortingDirection={updateSortingDirection}
            />
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
                      {Object.entries(columns).map(([_, column]) => {
                        //TODO
                        //Document cell value handler

                        return (<TableCell key={column.id}>
                          {column.displayAs &&
                              typeof column.displayAs === "function"
                            ? column.displayAs(row[column.id])
                            : defaultCellDisplay(row[column.id])}
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
          <TableFooter
            length_options={[1, 5, 10, 25]}
            onChangeSelectedPage={handleChangePage}
            onChangePageLength={handleChangeRowsPerPage}
            page_length={rowsPerPage}
            selected_page={page}
            selected_item_count={selected.size}
            total_count={total_count}
          />
        </TableContainer>
      </Paper>
    </div>
  );
}
