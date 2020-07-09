import React from "react";
import {
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@material-ui/core";

export default function Header({
  classes,
  columns,
  orderBy,
  updateSortingDirection,
}) {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align="left"
            padding="default"
            sortDirection={orderBy?.[column.id] || false}
          >
            {column.orderable
              ? (
                <TableSortLabel
                  active={orderBy?.[column.id] && true}
                  direction={orderBy?.[column.id] || "asc"}
                  onClick={(_) => updateSortingDirection(column.id)}
                  hideSortIcon={true}
                >
                  {column.label}
                  {orderBy?.[column.id] &&
                    <span className={classes.visuallyHidden}>
                      {orderBy?.[column.id] === "asc"
                        ? "Ordenado Ascendentemente"
                        : "Ordenado Descentemente"}
                    </span>}
                </TableSortLabel>
              )
              : (column.label)}
          </TableCell>
        ))}
        <TableCell
          align="left"
          padding="default"
        />
      </TableRow>
    </TableHead>
  );
}
