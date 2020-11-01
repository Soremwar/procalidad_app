import React from "react";
import {
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@material-ui/core";

export default function Header({
  classes,
  disable_selection,
  headers,
  numSelected,
  onSelectAllClick,
  orderBy,
  rowCount,
  updateSortingDirection,
}) {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          {!disable_selection && <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "Seleccionar Todo" }}
          />}
        </TableCell>
        {headers.map((headCell, id) => (
          <TableCell
            key={`${headCell.id}_${id}`}
            align={headCell.align || "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy?.[headCell.id] || false}
          >
            <TableSortLabel
              active={!!orderBy?.[headCell.id]}
              direction={orderBy?.[headCell.id] || "asc"}
              disabled={headCell.orderable === false}
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
        ))}
      </TableRow>
    </TableHead>
  );
}
