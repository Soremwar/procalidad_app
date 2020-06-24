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
  fetchPeopleApi,
} from "../../../lib/api/generator.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

const getPerson = (id) => fetchPeopleApi(id).then((x) => x.json());

const createPerson = async (form_data) => {
  return await fetchPeopleApi("", {
    method: "POST",
    body: form_data,
  });
};

const updatePerson = async (id, form_data) => {
  return await fetchPeopleApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deletePerson = async (id) => {
  return await fetchPeopleApi(id, {
    method: "DELETE",
  });
};

const headers = [
  { id: "identification", numeric: false, disablePadding: false, label: "Identificacion", searchable: true},
  { id: "name", numeric: false, disablePadding: false, label: "Nombre", searchable: true},
  { id: "phone", numeric: false, disablePadding: false, label: "Telefono", searchable: true},
  { id: "email", numeric: false, disablePadding: false, label: "Correo", searchable: true},
];

const AddModal = ({
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
    const request = await createPerson(new URLSearchParams(form_data));

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
        label="Tipo de Identificacion"
        fullWidth
        name="type"
        required
      >
        <option value="CC">Cedula de Ciudadania</option>
        <option value="CE">Cedula de Extranjeria</option>
        <option value="PA">Pasaporte</option>
        <option value="RC">Registro Civil</option>
        <option value="TI">Tarjeta de Identidad</option>
      </SelectField>
      <TextField
        fullWidth
        label="Identificacion"
        margin="dense"
        name="identification"
        required
      />
      <TextField
        fullWidth
        label="Nombre"
        margin="dense"
        name="name"
        required
      />
      <TextField
        fullWidth
        label="Telefono"
        margin="dense"
        name="phone"
        required
      />
      <TextField
        fullWidth
        label="Correo"
        margin="dense"
        name="email"
        required
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
    type: "",
    identification: "",
    name: "",
    phone: "",
    email: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        type: data.tipo_identificacion,
        identification: data.identificacion,
        name: data.nombre,
        phone: data.telefono,
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
    const id = data.pk_persona;
    const request = await updatePerson(id, new URLSearchParams(form_data));

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
        label="Tipo de Identificacion"
        fullWidth
        name="type"
        onChange={(event) => handleChange(event)}
        required
        value={fields.type}
      >
        <option value="CC">Cedula de Ciudadania</option>
        <option value="CE">Cedula de Extranjeria</option>
        <option value="PA">Pasaporte</option>
        <option value="RC">Registro Civil</option>
        <option value="TI">Tarjeta de Identidad</option>
      </SelectField>
      <TextField
        fullWidth
        label="Identificacion"
        margin="dense"
        name="identification"
        onChange={(event) => handleChange(event)}
        required
        value={fields.identification}
      />
      <TextField
        fullWidth
        label="Nombre"
        margin="dense"
        name="name"
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        label="Telefono"
        margin="dense"
        name="phone"
        onChange={(event) => handleChange(event)}
        required
        value={fields.phone}
      />
      <TextField
        fullWidth
        label="Correo"
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

    const delete_progress = selected.map((id) => deletePerson(id));

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
      title={"Eliminar Elementos"}
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
  const [selected_project_type, setSelectedArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    const data = await getPerson(id);
    setSelectedArea(data);
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
      <Title title={"Persona"} />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        data={selected_project_type}
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
          <Widget noBodyPadding>
            <AsyncTable
              columns={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              update_table={tableShouldUpdate}
              url={"organizacion/persona/table"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
