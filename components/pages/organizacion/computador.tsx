import React, { Fragment, useEffect, useState } from "react";
import {
  DialogContentText,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from "@material-ui/core";
import {
  Add as AddIcon,
  CalendarToday as DateIcon,
  Create as EditIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import { formatResponseJson, Response } from "../../../lib/api/request";
import { fetchComputerApi } from "../../../lib/api/generator.js";
import {
  Computer,
  ComputerCost,
  ComputerData,
} from "../../../api/models/interfaces";
import { useMountReference } from "../../common/hooks";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DataTable, { Column, Options } from "../../common/DataTable";
import DateField from "../../common/DateField.jsx";
import CurrencyField from "@unicef/material-ui-currency-textfield";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";

type ComputerParameters = Omit<Computer, "id">;
type ComputerCostParameters = Omit<ComputerCost, "id" | "computer">;
type ComputerDataParameters = ComputerParameters & {
  costs: ComputerCostParameters[];
};

const getComputer = (id) => fetchComputerApi<ComputerData>(id);

const createComputer = async (computer_data: ComputerParameters) =>
  fetchComputerApi("", {
    body: JSON.stringify(computer_data),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateComputer = async (
  id: number,
  computer: ComputerParameters,
  costs: ComputerCostParameters[],
) =>
  fetchComputerApi(id, {
    body: JSON.stringify({
      ...computer,
      costs,
    } as ComputerDataParameters),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteComputer = async (id: number) =>
  fetchComputerApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Nombre",
    searchable: true,
  },
  {
    id: "description",
    numeric: false,
    disablePadding: false,
    label: "Descripción",
    searchable: true,
  },
];

const DEFAULT_COMPUTER_FIELDS: ComputerParameters = {
  description: "",
  name: "",
};

const AddModal = ({
  closeModal,
  is_open,
  updateTable,
}) => {
  const [fields, setFields] = useState<ComputerParameters>(
    DEFAULT_COMPUTER_FIELDS,
  );
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (is_open) {
      setFields(DEFAULT_COMPUTER_FIELDS);
      setLoading(false);
      setError("");
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createComputer(fields);

    if (request.ok) {
      closeModal();
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={closeModal}
      title={"Crear Nuevo"}
    >
      <TextField
        fullWidth
        inputProps={{
          maxLength: 100,
        }}
        label="Computador"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: 255,
        }}
        label="Descripción"
        name="description"
        onChange={handleChange}
        required
        value={fields.description}
      />
    </DialogForm>
  );
};

const computer_columns: Column[] = [
  {
    name: "start_date",
    label: "Inicio vigencia",
    options: {
      customBodyRender: (value) => (
        <Grid container>
          <Grid item md={9}>{value}</Grid>
          <Grid item md={3}>
            <DateIcon />
          </Grid>
        </Grid>
      ),
    },
  },
  {
    name: "end_date",
    label: "Fin vigencia",
    options: {
      customBodyRender: (value: string) => (
        <Grid container>
          <Grid item md={9}>{value}</Grid>
          <Grid item md={3}>
            <DateIcon />
          </Grid>
        </Grid>
      ),
    },
  },
  {
    name: "cost",
    label: "Costo",
    options: {
      customBodyRender: (value: string) => value,
    },
  },
];

const DEFAULT_COST_FIELDS = {
  cost: 0,
  end_date: "",
  start_date: "",
} as ComputerCostParameters;

const ItemModal = ({
  data,
  id,
  onClose,
  onSubmit,
  open,
}: {
  data?: ComputerCostParameters;
  id?: number;
  onClose: () => void;
  onSubmit: (
    id: number | undefined,
    computer_cost: ComputerCostParameters,
  ) => void;
  open: boolean;
}) => {
  const [fields, setFields] = useState<ComputerCostParameters>(
    DEFAULT_COST_FIELDS,
  );

  useEffect(() => {
    if (open) {
      setFields(data || DEFAULT_COST_FIELDS);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(id, {
      ...fields,
      end_date: fields.end_date || null,
    });
    onClose();
  };

  return (
    <DialogForm
      handleSubmit={handleSubmit}
      is_open={open}
      setIsOpen={onClose}
      size="md"
    >
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="start_date"
        onChange={handleChange}
        required
        value={fields.start_date}
      />
      <DateField
        fullWidth
        label="Fecha fin"
        name="end_date"
        onChange={handleChange}
        value={fields.end_date}
      />
      <CurrencyField
        currencySymbol="$"
        decimalPlaces={0}
        fullWidth
        label="Costo"
        minimumValue="0"
        name="cost"
        onChange={(_ev, value: number) => {
          setFields((prevState) => ({ ...prevState, cost: value }));
        }}
        outputFormat="number"
        required
        value={fields.cost}
      />
    </DialogForm>
  );
};

const EditModal = ({
  closeModal,
  data,
  open,
  updateTable,
}: {
  data: ComputerData;
  open: boolean;
  closeModal: () => void;
  updateTable: () => void;
}) => {
  const [entries, setEntries] = useState<ComputerCostParameters[]>([]);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<ComputerParameters>(
    DEFAULT_COMPUTER_FIELDS,
  );
  const [item_modal_open, setItemModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected_item, setSelectedItem] = useState<
    { data: ComputerCostParameters; index: number } | undefined
  >();

  useEffect(() => {
    if (open) {
      const {
        costs,
        ...fields
      } = data;

      setEntries(costs);
      setFields(fields);

      setLoading(false);
      setError("");
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateComputer(
      data.id,
      fields,
      entries,
    );

    if (request.ok) {
      closeModal();
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  const options: Options = {
    customToolbar: () => (
      <Tooltip title="Agregar">
        <IconButton
          onClick={() => {
            setSelectedItem(undefined);
            setItemModalOpen(true);
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
    ),
    customToolbarSelect: ({ data }, _display_data, setSelectedRows) => (
      <Fragment>
        <Tooltip title="Editar">
          <IconButton
            onClick={() => {
              setSelectedItem({
                data: entries[data[0].dataIndex],
                index: data[0].dataIndex,
              });
              setItemModalOpen(true);
              setSelectedRows([]);
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            onClick={() => {
              const new_entries = entries.filter((_entry, index) =>
                index !== data[0].dataIndex
              );
              setEntries(new_entries);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Fragment>
    ),
    download: false,
    filter: false,
    print: false,
    responsive: "vertical",
    rowsPerPage: 10,
    search: false,
    selectableRows: "single",
  };

  return (
    <Fragment>
      <DialogForm
        error={error}
        handleSubmit={handleSubmit}
        is_loading={loading}
        is_open={open}
        setIsOpen={closeModal}
        size="lg"
        title="Editar"
      >
        <TextField
          fullWidth
          label="Computador"
          name="name"
          onChange={handleChange}
          required
          value={fields.name}
        />
        <TextField
          fullWidth
          label="Descripción"
          name="description"
          onChange={handleChange}
          required
          value={fields.description}
        />
        <br />
        <br />
        <DataTable
          columns={computer_columns}
          data={entries}
          options={options}
        />
      </DialogForm>
      <ItemModal
        data={selected_item?.data}
        id={selected_item?.index}
        onClose={() => setItemModalOpen(false)}
        onSubmit={(id, external_cost) => {
          if (id === undefined) {
            setEntries((prev_state) => [...prev_state, external_cost]);
          } else {
            entries[id] = external_cost;
            setEntries([...entries]);
          }
        }}
        open={item_modal_open}
      />
    </Fragment>
  );
};

const DeleteModal = ({
  closeModal,
  is_open,
  selected,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteComputer(id));

    Promise.allSettled(delete_progress)
      .then((results) =>
        results.reduce(async (total, result) => {
          if (result.status == "rejected") {
            total.push(result.reason.message);
          } else if (!result.value.ok) {
            total.push(await formatResponseJson(result.value));
          }
          return total;
        }, [])
      )
      .then((errors) => {
        if (errors.length) {
          setError(errors[0]);
        } else {
          closeModal();
        }
        setLoading(false);
        updateTable();
      });
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={closeModal}
      title={"Eliminar Elementos"}
      confirmButtonText={"Confirmar"}
    >
      <DialogContentText>
        Esta operacion no se puede deshacer. ¿Esta seguro que desea eliminar
        estos <b>{selected.length}</b>
        &nbsp;elementos?
      </DialogContentText>
    </DialogForm>
  );
};

export default function Computador() {
  const mounted = useMountReference();

  const [add_modal_open, setAddModalOpen] = useState(false);
  const [delete_modal_open, setDeleteModalOpen] = useState(false);
  const [edit_modal_open, setEditModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_computer, setSelectedComputer] = useState<ComputerData>();
  const [update_table, setUpdateTable] = useState(false);

  const handleEditModalOpen = async (id) => {
    const computer = await getComputer(id)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error();
      })
      .catch((error) =>
        console.error("Couldn't load the selected computer", error)
      );

    if (mounted.current) {
      setSelectedComputer(computer);
      setEditModalOpen(true);
    }
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setUpdateTable(true);
  };

  useEffect(() => {
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Computador"} />
      <AddModal
        closeModal={() => setAddModalOpen(false)}
        is_open={add_modal_open}
        updateTable={updateTable}
      />
      <EditModal
        closeModal={() => setEditModalOpen(false)}
        data={selected_computer}
        open={edit_modal_open}
        updateTable={updateTable}
      />
      <DeleteModal
        closeModal={() => setDeleteModalOpen(false)}
        is_open={delete_modal_open}
        selected={selected}
        updateTable={updateTable}
      />
      <AsyncTable
        columns={headers}
        onAddClick={() => setAddModalOpen(true)}
        onEditClick={(id) => handleEditModalOpen(id)}
        onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
        onTableUpdate={() => setUpdateTable(false)}
        update_table={update_table}
        url="organizacion/computador/table"
      />
    </Fragment>
  );
}
