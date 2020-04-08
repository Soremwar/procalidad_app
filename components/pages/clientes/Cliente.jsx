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

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const getSectors = () => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/sector`;
  return fetch(`${url}`)
    .then((x) => x.json())
    .then((x) => Object.values(x));
};

const getClient = (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/cliente/${id}`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const createClient = async (form_data) => {
  //TODO
  //Remove hardcoded url
  const url = "http://localhost/api/clientes/cliente";
  return fetch(`${url}`, {
    method: "POST",
    body: form_data,
  });
};

const updateClient = async (id, form_data) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/cliente/${id}`;
  return fetch(`${url}`, {
    method: "PUT",
    body: form_data,
  });
};

const deleteClient = async (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/cliente/${id}`;
  return fetch(`${url}`, {
    method: "DELETE",
  });
};

const headers = [
  { id: "sector", numeric: false, disablePadding: false, label: "Sector" },
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  {
    id: "business",
    numeric: false,
    disablePadding: false,
    label: "Razon Social",
  },
  { id: "nit", numeric: false, disablePadding: false, label: "NIT" },
];

const AddModal = ({
  is_open,
  sectors,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const request = await createClient(new URLSearchParams(form_data));

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
      <SelectField
        label="Sector"
        fullWidth
        name="sector"
        required
      >
        {sectors.map(({ pk_sector, nombre }) => (
          <option key={pk_sector} value={pk_sector}>{nombre}</option>
        ))}
      </SelectField>
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
  sectors,
  setModalOpen,
  updateTable,
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
    const request = await updateClient(id, new URLSearchParams(form_data));

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
      <SelectField
        fullWidth
        label="Sector"
        name="sector"
        onChange={(event) => handleChange(event)}
        required
        value={fields.sector}
      >
        {sectors.map(({ pk_sector, nombre }) => (
          <option key={pk_sector} value={pk_sector}>{nombre}</option>
        ))}
      </SelectField>
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
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteClient(id));

    //TODO
    //Add error catching
    Promise.all(delete_progress)
      .then(() => {
        setModalOpen(false);
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
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);
  const [sectors, setSectors] = useState([]);

  const handleEditModalOpen = async (id) => {
    const data = await getClient(id);
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
    getSectors().then((res) => setSectors(res));
  }, [false]);

  return (
    <Fragment>
      <Title title={"Contactos"} />
      <AddModal
        is_open={is_add_modal_open}
        sectors={sectors}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        data={selected_contact}
        is_open={is_edit_modal_open}
        sectors={sectors}
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
              data_index={"pk_cliente"}
              data_source={"http://localhost/api/clientes/cliente/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Contactos"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
