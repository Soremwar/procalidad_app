import React from "react";
import { Grid, TablePagination, Typography } from "@material-ui/core";

export default function Footer({
  disable_selection,
  length_options,
  onChangeSelectedPage,
  onChangePageLength,
  page_length,
  selected_item_count,
  selected_page,
  total_count,
}) {
  return (
    <Grid container alignItems="center">
      <Grid container item xs={6} justify="flex-start">
        {!disable_selection &&
          <Typography variant="subtitle1">
            {selected_item_count} seleccionados
          </Typography>}
      </Grid>
      <Grid container item xs={6} justify="flex-end">
        <TablePagination
          rowsPerPageOptions={length_options}
          component="div"
          count={total_count}
          labelDisplayedRows={({ from, to, count }) =>
            `Viendo ${from}-${to} de ${count}`}
          labelRowsPerPage="Filas por pagina"
          rowsPerPage={page_length}
          page={selected_page}
          onChangePage={onChangeSelectedPage}
          onChangeRowsPerPage={onChangePageLength}
        />
      </Grid>
    </Grid>
  );
}
