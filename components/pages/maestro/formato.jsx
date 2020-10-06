import React, { Fragment, useEffect, useState } from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.js";
import { fetchFormatApi } from "../../../lib/api/generator.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";

const getFormat = (id) => fetchFormatApi(id).then((x) => x.json());

const createFormat = async (
  name,
  path,
  size,
  extensions,
) =>
  fetchFormatApi("", {
    body: JSON.stringify({
      name,
      path,
      size,
      extensions,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateFormat = async (
  id,
  name,
  path,
  size,
  extensions,
) =>
  fetchFormatApi(id, {
    body: JSON.stringify({
      name,
      path,
      size,
      extensions,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteFormat = async (id) =>
  fetchFormatApi(id, {
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
    id: "size",
    numeric: false,
    disablePadding: false,
    label: "Tamaño",
    searchable: true,
  },
  {
    id: "path",
    numeric: false,
    disablePadding: false,
    label: "Ruta",
    searchable: true,
  },
  {
    id: "extensions",
    numeric: false,
    disablePadding: false,
    label: "Extensiones",
    searchable: true,
  },
];

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    name: "",
    path: "",
    size: "",
    extensions: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: "",
        path: "",
        size: "",
        extensions: "",
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

    const extensions_are_valid = /^([a-zA-z]+)(,\s*[a-zA-z]+\s*)*$/.test(
      fields.extensions,
    );
    if (!extensions_are_valid) {
      console.error("extensions are not comma");
      return;
    }
    const extensions = fields.extensions.split(",").map((x) => x.trim());
    if (extensions.some((x) => x.length > 10)) {
      console.error("extensions are too long");
      return;
    }

    const request = await createFormat(
      fields.name,
      fields.path,
      fields.size,
      extensions,
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
        label="Nombre Completo"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        label="Ruta"
        margin="dense"
        name="path"
        onChange={(event) => {
          const path = event.target.value
            .replace(/[\s_]+/g, "_")
            .replace(/\W+/g, "")
            .toUpperCase();
          setFields((prev_state) => ({ ...prev_state, path }));
        }}
        value={fields.path}
      />
      <TextField
        fullWidth
        InputProps={{
          inputProps: {
            min: "1",
          },
        }}
        label="Tamaño"
        margin="dense"
        name="size"
        onChange={handleChange}
        type="number"
        value={fields.size}
      />
      <TextField
        fullWidth
        label="Extensiones"
        margin="dense"
        name="extensions"
        onChange={handleChange}
        value={fields.extensions}
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
    name: "",
    path: "",
    size: "",
    extensions: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: data.name,
        path: data.path,
        size: data.size,
        extensions: data.extensions.join(","),
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

    const extensions_are_valid = /^([a-zA-z]+)(,\s*[a-zA-z]+\s*)*$/.test(
      fields.extensions,
    );
    if (!extensions_are_valid) {
      console.error("extensions are invalid");
      return;
    }
    const extensions = fields.extensions.split(",").map((x) => x.trim());
    if (extensions.some((x) => x.length > 10)) {
      console.error("extensions are too long");
      return;
    }

    const request = await updateFormat(
      data.id,
      fields.name,
      fields.path,
      fields.size,
      extensions,
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
        label="Nombre Completo"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        disabled
        fullWidth
        label="Ruta"
        margin="dense"
        name="path"
        value={fields.path}
      />
      <TextField
        fullWidth
        InputProps={{
          inputProps: {
            min: "1",
          },
        }}
        margin="dense"
        name="size"
        label="Tamaño"
        onChange={handleChange}
        type="number"
        value={fields.size}
      />
      <TextField
        fullWidth
        label="Extensiones"
        margin="dense"
        name="extensions"
        onChange={handleChange}
        value={fields.extensions}
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

    const delete_progress = selected.map((id) => deleteFormat(id));

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
      title={"Crear Nuevo"}
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
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected_contact, setSelectedContact] = useState({});
  const [table_selected, setTableSelected] = useState([]);
  const [table_should_update, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedContact(await getFormat(id));
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setTableSelected(selected);
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
      <Title title={"Formato"} />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        data={selected_contact}
        is_open={is_edit_modal_open}
        setModalOpen={setEditModalOpen}
        updateTable={updateTable}
      />
      <DeleteModal
        is_open={is_delete_modal_open}
        selected={table_selected}
        setModalOpen={setDeleteModalOpen}
        updateTable={updateTable}
      />
      <AsyncTable
        columns={headers}
        onAddClick={() => setAddModalOpen(true)}
        onEditClick={(id) => handleEditModalOpen(id)}
        onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
        onTableUpdate={() => setTableShouldUpdate(false)}
        update_table={table_should_update}
        url={"maestro/formato/table"}
      />
    </Fragment>
  );
};
