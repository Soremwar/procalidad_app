import React from "react";
import { lighten, makeStyles } from "@material-ui/core/styles";
import {
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from "@material-ui/core";
import {
  AddBox as AddIcon,
  Create as EditICon,
  Delete as DeleteIcon
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
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

export default function Menu({
  numSelected,
  onAddClick,
  onEditClick,
  onDeleteClick,
  selected,
  title,
}) {
  const classes = useStyles();

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
}
