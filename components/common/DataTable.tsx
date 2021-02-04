import React from "react";
import MuiDataTable from "mui-datatables";

export interface Column {
  label?: string;
  name: string;
  options?: {
    customBodyRender?: (
      value: unknown,
      table_metadata: unknown,
      updateValue: (value: unknown) => void,
    ) => Element;
    /** If false, the column won't be displayed in the column filter selection */
    filter?: boolean;
    /** If false, the column won't be selectable in the search section */
    searchable?: boolean;
    /** If false, the column won't display an option to sort */
    sort?: boolean;
  };
}

interface SelectedRows {
  data: Array<{
    /** Id of the item relative to the table position */
    index: number;
    /** Id of the item relative to the data passed for rendering */
    dataIndex: number;
  }>;
  /**
   * An object containing the ids of the rows in the table
   * and their selected status
   * */
  lookup: Record<number, boolean>;
}

export interface Options {
  customToolbar: (display_data: unknown) => Element;
  customToolbarSelect: (
    selected_rows: SelectedRows,
    display_data: unknown,
    /** The table ids of the rows to select */
    setSelectedRows: (rows: number[]) => void,
  ) => Element;
  /**
   * This will display the download option in the toolbar
   *
   * true by default
   * */
  download?: boolean;
  /**
   * This will display the filter option in the toolbar
   *
   * true by default
   * */
  filter?: boolean;
  /**
   * This will display the print option in the toolbar
   *
   * true by default
   * */
  print?: boolean;
  /**
   * - "vertical": In smaller views the table cells will collapse such that the heading is to the left of the cell value
   * - "standard": Table will stay in the standard mode but make small changes to better fit the allocated space
   * - "simple": On very small devices the table rows will collapse into simple display
   *
   * "vertical" by default
   * */
  responsive?: "simple" | "standard" | "vertical";
  /** 10 by default */
  rowsPerPage?: number;
  /**
   * This will display the search option in the toolbar
   *
   * true by default
   * */
  search?: boolean;
  /**
   * - "multiple": Several rows can be selected
   * - "none": Select option won't be displayed
   * - "single": Only a row at a time can be selected
   *
   * "single" by default
   * */
  selectableRows?: "multiple" | "none" | "single";
}

export default function DataTable<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  columns,
  data,
  options,
}: {
  columns: Column[];
  data: Array<T>;
  options?: Options;
}) {
  return <MuiDataTable columns={columns} data={data} options={options} />;
}
