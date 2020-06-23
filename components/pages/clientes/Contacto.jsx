import React, {
  Fragment,
  useEffect,
  useState
} from "react";
import {
  DialogContentText,
  Grid,
  TextField
} from "@material-ui/core";

import {
  formatResponseJson,
} from "../../../lib/api/request.js";
import {
  fetchContactApi,
  fetchClientApi,
} from "../../../lib/api/generator.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import SelectField from "../../common/SelectField.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

const getClients = () => fetchClientApi().then((x) => x.json());

const getContact = (id) => fetchContactApi(id).then((x) => x.json());

const createContact = async (form_data) => {
  return await fetchContactApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateContact = async (id, form_data) => {
  return await fetchContactApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteContact = async (id) => {
  return await fetchContactApi(id, {
    method: "DELETE",
  });
};

const headers = [
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "phone", numeric: false, disablePadding: false, label: "Telefono" },
  { id: "email", numeric: false, disablePadding: false, label: "Correo" },
];

const AddModal = ({
  clients,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const request = await createContact(new URLSearchParams(form_data));

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
        autoFocus
        margin="dense"
        name="name"
        label="Nombre Completo"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="area"
        label="Area"
        fullWidth
      />
      <TextField
        autoFocus
        margin="dense"
        name="position"
        label="Cargo"
        fullWidth
      />
      <SelectField
        fullWidth
        label="Cliente"
        name="client"
        required
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        margin="dense"
        name="phone"
        label="Telefono"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="phone_2"
        label="Telefono 2"
        fullWidth
      />
      <TextField
        autoFocus
        margin="dense"
        name="email"
        label="Email"
        fullWidth
        required
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
  const [fields, setFields] = useState({});
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
    }
  }, [is_open]);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFields((prev_state) => {
      const data = ({ ...prev_state, [name]: value });
      return data;
    });
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const id = data.pk_contacto;
    const request = await updateContact(id, new URLSearchParams(form_data));

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
        label="Nombre Completo"
        margin="dense"
        name="name"
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        autoFocus
        fullWidth
        label="Area"
        margin="dense"
        name="area"
        onChange={(event) => handleChange(event)}
        value={fields.area}
      />
      <TextField
        autoFocus
        fullWidth
        label="Cargo"
        margin="dense"
        name="position"
        onChange={(event) => handleChange(event)}
        value={fields.position}
      />
      <SelectField
        fullWidth
        label="Cliente"
        name="client"
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
        label="Telefono"
        margin="dense"
        name="phone"
        onChange={(event) => handleChange(event)}
        required
        value={fields.phone}
      />
      <TextField
        autoFocus
        fullWidth
        label="Telefono 2"
        margin="dense"
        name="phone_2"
        onChange={(event) => handleChange(event)}
        value={fields.phone_2}
      />
      <TextField
        autoFocus
        fullWidth
        label="Email"
        margin="dense"
        name="email"
        onChange={(event) => handleChange(event)}
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
      .then((results) => results.reduce(async (total, result) => {
        if (result.status == 'rejected') {
          total.push(result.reason.message);
        } else if (!result.value.ok) {
          total.push(await formatResponseJson(result.value));
        }
        return total;
      }, []))
      .then(errors => {
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
        Esta operacion no se puede deshacer.
        ¿Esta seguro que desea eliminar estos <b>{selected.length}</b>
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
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);
  const [clients, setClients] = useState([]);
  const [selected_client, setSelectedClient] = useState("");

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
    getClients().then((x) => setClients(x));
  }, []);

  useEffect(() => {
    updateTable();
  }, [selected_client]);

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
      <Grid container spacing={10}>
        <Grid item xs={6}>
          <SelectField
            fullWidth
            label="Cliente"
            onChange={event => setSelectedClient(event.target.value)}
            value={selected_client}
          >
            {clients.map(({ pk_cliente, nombre }) => (
              <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
            ))}
          </SelectField>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget title="Lista" upperTitle noBodyPadding>
            <AsyncTable
              data_source={"clientes/contacto/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              search={{
                id_client: selected_client,
              }}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Contactos"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
