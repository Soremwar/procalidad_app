import React from "react";
import {
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@material-ui/core";

export default function Header({
  columns,
  edit_mode,
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
                </TableSortLabel>
              )
              : (column.label)}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
