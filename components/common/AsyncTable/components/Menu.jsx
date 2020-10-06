import React from "react";
import { lighten, makeStyles } from "@material-ui/core/styles";
import { Grid, IconButton, Toolbar, Tooltip } from "@material-ui/core";
import {
  AddBox as AddIcon,
  Create as EditICon,
  Delete as DeleteIcon,
} from "@material-ui/icons";

import Search from "./Search.jsx";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight: theme.palette.type === "light"
    ? {
      color: theme.palette.text.secondary,
      backgroundColor: lighten(theme.palette.secondary.light, 0.85),
    }
    : {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.secondary.dark,
    },
}));

export default function Menu({
  columns,
  numSelected,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onFilterChange,
  selected,
}) {
  const classes = useStyles();

  return (
    <Toolbar
      className={[
        classes.root,
        classes.highlight,
      ].join(" ")}
    >
      <Grid container alignItems="center">
        <Grid container item xs={6} justify="flex-start">
          {!!columns.filter((column) => column.searchable).length && (
            <Search
              fullWidth
              onChange={onFilterChange}
              options={columns.filter((column) => column.searchable)}
              variant="outlined"
            />
          )}
        </Grid>
        <Grid container item xs={6} justify="flex-end">
          <Tooltip title="Agregar">
            <IconButton aria-label="add" onClick={onAddClick}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          {numSelected == 1 &&
            (
              <Tooltip title="Editar">
                <IconButton
                  aria-label="edit"
                  onClick={() => onEditClick(Array.from(selected)[0])}
                >
                  <EditICon />
                </IconButton>
              </Tooltip>
            )}
          {numSelected > 0 &&
            (
              <Tooltip title="Eliminar">
                <IconButton
                  aria-label="delete"
                  onClick={() => onDeleteClick(Array.from(selected))}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
        </Grid>
      </Grid>
    </Toolbar>
  );
}
