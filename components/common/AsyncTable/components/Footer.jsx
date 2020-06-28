import React from "react";
import {
  Grid,
  TablePagination,
  Typography,
} from "@material-ui/core";

export default ({
  length_options,
  onChangeSelectedPage,
  onChangePageLength,
  page_length,
  selected_item_count,
  selected_page,
  total_count,
}) => {
  return (
    <Grid container alignItems="center">
      <Grid container item xs={6} justify="flex-start">
        <Typography variant="subtitle1">
          {selected_item_count} seleccionados
        </Typography>
      </Grid>
      <Grid container item xs={6} justify="flex-end">
        <TablePagination
          rowsPerPageOptions={length_options}
          component="div"
          count={total_count}
          rowsPerPage={page_length}
          page={selected_page}
          onChangePage={onChangeSelectedPage}
          onChangeRowsPerPage={onChangePageLength}
        />
      </Grid>
    </Grid>
  );
};
