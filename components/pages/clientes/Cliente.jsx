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

import AsyncTable from "../../common/AsyncTable.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const getTableData = async (error_callback = () => {}) => {
  //TODO
  //Remove hardcoded url
  const url = "http://localhost/api/clientes/cliente";
  return await fetch(`${url}`)
    .then((x) => x.json())
    .catch(error_callback);
};

const getContact = (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/cliente/${id}`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const createContact = async (form_data) => {
  //TODO
  //Remove hardcoded url
  const url = "http://localhost/api/clientes/cliente";
  return await fetch(`${url}`, {
    method: "POST",
    body: form_data,
  });
};

const updateContact = async (id, form_data) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/cliente/${id}`;
  return await fetch(`${url}`, {
    method: "PUT",
    body: form_data,
  });
};

const deleteContact = async (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/cliente/${id}`;
  return await fetch(`${url}`, {
    method: "DELETE",
  });
};

const headers = [
  { id: "sector", numeric: true, disablePadding: true, label: "Sector" },
  { id: "nombre", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "nit", numeric: false, disablePadding: false, label: "NIT" },
  {
    id: "d_verificacion",
    numeric: true,
    disablePadding: false,
    label: "Digito",
  },
  {
    id: "razon_social",
    numeric: false,
    disablePadding: false,
    label: "Razon Social",
  },
  { id: "ciudad", numeric: false, disablePadding: false, label: "Ciudad" },
  {
    id: "direccion",
    numeric: false,
    disablePadding: false,
    label: "Direccion",
  },
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
        name="sector"
        label="Sector"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Nombre Cliente"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="nit"
        label="NIT"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="verification_digit"
        label="Digito de Verificacion"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="business"
        label="Razon Social"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="city"
        label="Ciudad"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="address"
        label="Direccion"
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
    if (is_open) {
      setFields({
        sector: data.fk_sector,
        name: data.nombre,
        nit: data.nit,
        verification_digit: data.d_verificacion,
        business: data.razon_social,
        city: data.ciudad,
        address: data.direccion,
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
    const id = data.pk_cliente;
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
        margin="dense"
        name="sector"
        label="Sector"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.sector}
      />
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Nombre Cliente"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        autoFocus
        margin="dense"
        name="nit"
        label="NIT"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.nit}
      />
      <TextField
        autoFocus
        margin="dense"
        name="verification_digit"
        label="Digito de Verificacion"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.verification_digit}
      />
      <TextField
        autoFocus
        margin="dense"
        name="business"
        label="Razon Social"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.business}
      />
      <TextField
        autoFocus
        margin="dense"
        name="city"
        label="Ciudad"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.city}
      />
      <TextField
        autoFocus
        margin="dense"
        name="address"
        label="Direccion"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.address}
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

    const delete_progress = selected.map((id) => deleteContact(id));

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
        ¿Esta seguro que desea eliminar estos <b>{selected.length}</b>
        elementos?
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

  const handleEditModalOpen = async (id) => {
    const data = await getContact(id);
    setSelectedContact(data);
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

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
              data_index={"pk_cliente"}
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
