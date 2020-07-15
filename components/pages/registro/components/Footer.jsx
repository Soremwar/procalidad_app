import React from "react";
import {
  Button,
  Grid,
  TablePagination,
} from "@material-ui/core";

export default ({
  length_options,
  onChangeSelectedPage,
  onChangePageLength,
  onWeekSave,
  page_length,
  selected_page,
  total_count,
}) => {
  return (
    <Grid container alignItems="center">
      <Grid container item xs={6} justify="flex-start">
        <Button
          onClick={onWeekSave}
          variant="contained"
        >
          Cerrar Semana
        </Button>
      </Grid>
      <Grid container item xs={6} justify="flex-end">
        <TablePagination
          component="div"
          count={total_count}
          labelDisplayedRows={({ from, to, count }) =>
            `Viendo ${from}-${to} de ${count}`}
          labelRowsPerPage="Filas por pagina"
          rowsPerPage={page_length}
          rowsPerPageOptions={length_options}
          page={selected_page}
          onChangePage={onChangeSelectedPage}
          onChangeRowsPerPage={onChangePageLength}
        />
      </Grid>
    </Grid>
  );
};
