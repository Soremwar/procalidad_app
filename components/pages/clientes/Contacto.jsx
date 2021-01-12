import React, { Fragment, useEffect, useState } from "react";
import { DialogContentText, Grid, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.ts";
import { fetchClientApi, fetchContactApi } from "../../../lib/api/generator.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import SelectField from "../../common/SelectField.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

const getClients = () => fetchClientApi();

const getContact = (id) => fetchContactApi(id).then((x) => x.json());

const createContact = async (
  name,
  area,
  position,
  client,
  phone,
  phone_2,
  email,
) =>
  fetchContactApi("", {
    body: JSON.stringify({
      name,
      area,
      position,
      client,
      phone,
      phone_2,
      email,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateContact = async (
  id,
  name,
  area,
  position,
  client,
  phone,
  phone_2,
  email,
) =>
  fetchContactApi(id, {
    body: JSON.stringify({
      name,
      area,
      position,
      client,
      phone,
      phone_2,
      email,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteContact = async (id) =>
  fetchContactApi(id, {
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
    id: "phone",
    numeric: false,
    disablePadding: false,
    label: "Teléfono",
    searchable: true,
  },
  {
    id: "email",
    numeric: false,
    disablePadding: false,
    label: "Correo",
    searchable: true,
  },
  {
    id: "client",
    numeric: false,
    disablePadding: false,
    label: "Cliente",
    searchable: true,
  },
];

const AddModal = ({
  clients,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    name: "",
    area: "",
    position: "",
    client: "",
    phone: "",
    phone_2: "",
    email: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createContact(
      fields.name,
      fields.area,
      fields.position,
      fields.client,
      fields.phone,
      fields.phone_2,
      fields.email,
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

  useEffect(() => {
    if (is_open) {
      setFields({
        name: "",
        area: "",
        position: "",
        client: "",
        phone: "",
        phone_2: "",
        email: "",
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

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
        autoFocus
        margin="dense"
        name="name"
        label="Nombre completo"
        fullWidth
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        autoFocus
        margin="dense"
        name="area"
        label="Área"
        fullWidth
        onChange={handleChange}
        value={fields.area}
      />
      <TextField
        autoFocus
        margin="dense"
        name="position"
        label="Cargo"
        fullWidth
        onChange={handleChange}
        value={fields.position}
      />
      <SelectField
        fullWidth
        label="Cliente"
        name="client"
        onChange={handleChange}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        margin="dense"
        name="phone"
        label="Teléfono"
        fullWidth
        onChange={handleChange}
        required
        value={fields.phone}
      />
      <TextField
        autoFocus
        margin="dense"
        name="phone_2"
        label="Teléfono 2"
        fullWidth
        onChange={handleChange}
        value={fields.phone_2}
      />
      <TextField
        autoFocus
        margin="dense"
        name="email"
        label="Correo"
        fullWidth
        onChange={handleChange}
        required
        value={fields.email}
      />
    </DialogForm>
  );
};

const EditModal = ({
  clients,
  data,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    name: "",
    area: "",
    position: "",
    client: "",
    phone: "",
    phone_2: "",
    email: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: data.nombre,
        area: data.area || "",
        position: data.cargo || "",
        client: data.fk_cliente,
        phone: data.telefono,
        phone_2: data.telefono_2 || "",
        email: data.correo,
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

    const request = await updateContact(
      data.pk_contacto,
      fields.name,
      fields.area,
      fields.position,
      fields.client,
      fields.phone,
      fields.phone_2,
      fields.email,
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
        autoFocus
        fullWidth
        label="Nombre completo"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        autoFocus
        fullWidth
        label="Área"
        margin="dense"
        name="area"
        onChange={handleChange}
        value={fields.area}
      />
      <TextField
        autoFocus
        fullWidth
        label="Cargo"
        margin="dense"
        name="position"
        onChange={handleChange}
        value={fields.position}
      />
      <SelectField
        fullWidth
        label="Cliente"
        name="client"
        onChange={handleChange}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        fullWidth
        label="Teléfono"
        margin="dense"
        name="phone"
        onChange={handleChange}
        required
        value={fields.phone}
      />
      <TextField
        autoFocus
        fullWidth
        label="Teléfono 2"
        margin="dense"
        name="phone_2"
        onChange={handleChange}
        value={fields.phone_2}
      />
      <TextField
        autoFocus
        fullWidth
        label="Correo"
        margin="dense"
        name="email"
        onChange={handleChange}
        required
        value={fields.email}
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

    const delete_progress = selected.map((id) => deleteContact(id));

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
  const [selected, setSelected] = useState([]);
  const [selected_contact, setSelectedContact] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);
  const [clients, setClients] = useState([]);

  const handleEditModalOpen = async (id) => {
    const data = await getContact(id);
    setSelectedContact(data);
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
    getClients()
      .then(async (response) => {
        if (response.ok) {
          /** @type Array<{nombre: string}> */
          const clients = await response.json();
          setClients(
            clients.sort(({ nombre: x }, { nombre: y }) => x.localeCompare(y)),
          );
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("couldnt load clients"));
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Contactos"} />
      <AddModal
        clients={clients}
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        clients={clients}
        data={selected_contact}
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
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget title="Lista" upperTitle noBodyPadding>
            <AsyncTable
              columns={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              onTableUpdate={() => setTableShouldUpdate(false)}
              update_table={tableShouldUpdate}
              url={"clientes/contacto/table"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
