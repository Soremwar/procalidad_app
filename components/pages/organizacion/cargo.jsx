import React, { Fragment, useEffect, useState } from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.js";
import { fetchPositionApi } from "../../../lib/api/generator.js";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";

const getPosition = (id) => fetchPositionApi(id).then((x) => x.json());

const createPosition = async (
  description,
  name,
) =>
  fetchPositionApi("", {
    body: JSON.stringify({
      description,
      name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updatePosition = async (
  id,
  description,
  name,
) =>
  fetchPositionApi(id, {
    body: JSON.stringify({
      description,
      name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deletePosition = async (id) =>
  fetchPositionApi(id, {
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

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    description: "",
    name: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: "",
        description: "",
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createPosition(
      fields.description,
      fields.name,
    );

    if (request.ok) {
      setModalOpen(false);
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
      setIsOpen={setModalOpen}
      title={"Crear Nuevo"}
    >
      <TextField
        fullWidth
        label="Cargo"
        margin="dense"
        name="name"
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        label="Descripción"
        margin="dense"
        name="description"
        onChange={(event) => handleChange(event)}
        required
        value={fields.description}
      />
    </DialogForm>
  );
};

const EditModal = ({
  data,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    description: "",
    name: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: data.nombre,
        description: data.descripcion,
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updatePosition(
      data.pk_cargo,
      fields.description,
      fields.name,
    );

    if (request.ok) {
      setModalOpen(false);
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
      setIsOpen={setModalOpen}
      title={"Editar"}
    >
      <TextField
        fullWidth
        label="Cargo"
        margin="dense"
        name="name"
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        label="Descripción"
        margin="dense"
        name="description"
        onChange={(event) => handleChange(event)}
        required
        value={fields.description}
      />
    </DialogForm>
  );
};

const DeleteModal = ({
  is_open,
  selected,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deletePosition(id));

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
          setModalOpen(false);
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
      setIsOpen={setModalOpen}
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

export default () => {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_position, setSelectedPosition] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedPosition(await getPosition(id));
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Cargo"} />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        data={selected_position}
        is_open={is_edit_modal_open}
        setModalOpen={setEditModalOpen}
        updateTable={updateTable}
      />
      <DeleteModal
        is_open={is_delete_modal_open}
        setModalOpen={setDeleteModalOpen}
        selected={selected}
        updateTable={updateTable}
      />
      <AsyncTable
        columns={headers}
        onAddClick={() => setAddModalOpen(true)}
        onEditClick={(id) => handleEditModalOpen(id)}
        onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
        onTableUpdate={() => setTableShouldUpdate(false)}
        update_table={tableShouldUpdate}
        url={"organizacion/cargo/table"}
      />
    </Fragment>
  );
};
