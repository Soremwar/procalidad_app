import React, {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  DialogContentText,
  Grid,
  TextField
} from "@material-ui/core";

import AsyncTable from "../../common/AsyncTable.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

const getTableData = async (error_callback = () => {}) => {
  //TODO
  //Remove hardcoded url
  const url = "http://localhost/api/clientes/contacto";
  return await fetch(`${url}`)
    .then((x) => x.json())
    .catch(error_callback);
};

const getContact = (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/contacto/${id}`;
  return fetch(`${url}`)
    .then(x => x.json());
};

const createContact = async (form_data) => {
  //TODO
  //Remove hardcoded url
  const url = "http://localhost/api/clientes/contacto";
  return await fetch(`${url}`, {
    method: "POST",
    body: form_data,
  });
};

const updateContact = async (id, form_data) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/contacto/${id}`;
  return await fetch(`${url}`, {
    method: "PUT",
    body: form_data,
  });
};

const deleteContact = async id => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/contacto/${id}`;
  return await fetch(`${url}`, {
    method: "DELETE",
  });
}

const headers = [
  { id: "nombre", numeric: false, disablePadding: true, label: "Nombre" },
  { id: "area", numeric: true, disablePadding: false, label: "Area" },
  { id: "cargo", numeric: true, disablePadding: false, label: "Cargo" },
  { id: "cliente", numeric: true, disablePadding: false, label: "Cliente" },
  { id: "telefono", numeric: true, disablePadding: false, label: "Telefono" },
  {
    id: "telefono_2",
    numeric: true,
    disablePadding: false,
    label: "Telefono 2",
  },
  { id: "correo", numeric: true, disablePadding: false, label: "Correo" },
];

const AddModal = ({
  is_open,
  setModalOpen,
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
      <TextField
        autoFocus
        margin="dense"
        name="client"
        label="Cliente"
        fullWidth
        required
      />
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
  data,
  is_open,
  setModalOpen,
}) => {
  const [fields, setFields] = useState({});
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if(is_open){
      setFields({
        name: data.nombre,
        area: data.area || '',
        position: data.cargo || '',
        client: data.fk_cliente,
        phone: data.telefono,
        phone_2: data.telefono_2 || '',
        email: data.correo,
      });
    }
  }, [is_open]);
  
  const handleChange = event => {
    const name = event.target.name;
    const value = event.target.value;
    setFields(prev_state => {
      const data = ({...prev_state, [name]: value});
      return data;
    });
  }

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const id = data.pk_contacto;
    const request = await updateContact(id, new URLSearchParams(form_data));

    if (request.ok) {
      setModalOpen(false);
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
        onChange={event => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        autoFocus
        fullWidth
        label="Area"
        margin="dense"
        name="area"
        onChange={event => handleChange(event)}
        value={fields.area}
      />
      <TextField
        autoFocus
        fullWidth
        label="Cargo"
        margin="dense"
        name="position"
        onChange={event => handleChange(event)}
        value={fields.position}
      />
      <TextField
        autoFocus
        fullWidth
        label="Cliente"
        margin="dense"
        name="client"
        onChange={event => handleChange(event)}
        required
        value={fields.client}
      />
      <TextField
        autoFocus
        fullWidth
        label="Telefono"
        margin="dense"
        name="phone"
        onChange={event => handleChange(event)}
        required
        value={fields.phone}
      />
      <TextField
        autoFocus
        fullWidth
        label="Telefono 2"
        margin="dense"
        name="phone_2"
        onChange={event => handleChange(event)}
        value={fields.phone_2}
      />
      <TextField
        autoFocus
        fullWidth
        label="Email"
        margin="dense"
        name="email"
        onChange={event => handleChange(event)}
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
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map(id => deleteContact(id));

    //TODO
    //Add error catching
    Promise.all(delete_progress)
      .then(() => setModalOpen(false))
      .finally(() => setLoading(false));
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
        ¿Esta seguro que desea eliminar estos <b>{selected.length}</b> elementos?
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

  const handleEditModalOpen = async id => {
    const data = await getContact(id);
    setSelectedContact(data);
    setEditModalOpen(true);
  }

  const handleDeleteModalOpen = async selected => {
    setSelected(selected);
    setDeleteModalOpen(true);
  }

  return (
    <Fragment>
      <Title title={"Contactos"} />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
      />
      <EditModal
        data={selected_contact}
        is_open={is_edit_modal_open}
        setModalOpen={setEditModalOpen}
      />
      <DeleteModal
        is_open={is_delete_modal_open}
        setModalOpen={setDeleteModalOpen}
        selected={selected}
      />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget title="Lista" upperTitle noBodyPadding>
            {/*
              TODO
              Reload table on change
            */}
            <AsyncTable
              data_index={"pk_contacto"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              retrieveData={getTableData}
              title={"Listado de Contactos"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
