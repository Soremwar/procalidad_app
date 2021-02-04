import React, { Fragment, useEffect, useState } from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson, Response } from "../../../lib/api/request";
import { fetchComputerApi } from "../../../lib/api/generator.js";
import { Computer, ComputerData } from "../../../api/models/interfaces";
import { useMountReference } from "../../common/hooks";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DataTable from "../../common/DataTable";
import CurrencyField from "@unicef/material-ui-currency-textfield";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";

type ComputerParameters = Omit<Computer, "id">;

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
  computer_data: ComputerParameters,
) =>
  fetchComputerApi(id, {
    body: JSON.stringify(computer_data),
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

const EditModal = ({
  closeModal,
  data,
  open,
  updateTable,
}: {
  data: Computer;
  open: boolean;
  closeModal: () => void;
  updateTable: () => void;
}) => {
  const [error, setError] = useState("");
  const [fields, setFields] = useState<ComputerParameters>(
    DEFAULT_COMPUTER_FIELDS,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFields(data);
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

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={loading}
      is_open={open}
      setIsOpen={closeModal}
      title={"Editar"}
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
    </DialogForm>
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
