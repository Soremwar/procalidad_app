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
import SelectField from "../../common/SelectField.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant


const getProjectTypes = () => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/tipo_proyecto`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const getClients = () => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/cliente`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const getAreas = () => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/organizacion/area`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const getProject = (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/proyecto/${id}`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const createProject = async (form_data) => {
  //TODO
  //Remove hardcoded url
  const url = "http://localhost/api/operaciones/proyecto";
  return await fetch(`${url}`, {
    method: "POST",
    body: form_data,
  });
};

const updateProject = async (id, form_data) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/proyecto/${id}`;
  return await fetch(`${url}`, {
    method: "PUT",
    body: form_data,
  });
};

const deleteProject = async (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/proyecto/${id}`;
  return await fetch(`${url}`, {
    method: "DELETE",
  });
};

const headers = [
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "area", numeric: false, disablePadding: false, label: "Area" },
  { id: "client", numeric: false, disablePadding: false, label: "Cliente" },
  { id: "status", numeric: false, disablePadding: false, label: "Estado" },
];

const AddModal = ({
  areas,
  clients,
  is_open,
  project_types,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const request = await createProject(new URLSearchParams(form_data));

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
        fullWidth
        label="Tipo de proyecto"
        name="type"
        required
      >
        {project_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
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
      <SelectField
        fullWidth
        label="Area"
        name="area"
        required
      >
        {areas.map(({ pk_area, nombre }) => (
          <option key={pk_area} value={pk_area}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Nombre del Proyecto"
        fullWidth
        required
      />
      <TextField
        autoFocus
        fullWidth
        label="Descripcion"
        margin="dense"
        multiline
        name="description"
        required
      />
      <SelectField
        fullWidth
        label="Estado"
        name="status"
        required
      >
        <option value={0}>{"No iniciado"}</option>
        <option value={1}>{"Completado"}</option>
        <option value={2}>{"En proceso"}</option>
      </SelectField>
    </DialogForm>
  );
};

const EditModal = ({
  areas,
  clients,
  data,
  is_open,
  project_types,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    type: '',
    client: '',
    area: '',
    name: '',
    description: '',
    status: '',
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        type: data.fk_tipo_proyecto,
        client: data.fk_cliente,
        area: data.fk_area,
        name: data.nombre,
        description: data.descripcion,
        status: data.estado,
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
    const id = data.pk_proyecto;
    const request = await updateProject(id, new URLSearchParams(form_data));

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
        label="Tipo de proyecto"
        name="type"
        onChange={event => handleChange(event)}
        required
        value={fields.type}
      >
        {project_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Cliente"
        name="client"
        onChange={event => handleChange(event)}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Area"
        name="area"
        onChange={event => handleChange(event)}
        required
        value={fields.area}
      >
        {areas.map(({ pk_area, nombre }) => (
          <option key={pk_area} value={pk_area}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Nombre del Proyecto"
        fullWidth
        onChange={event => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        autoFocus
        fullWidth
        label="Descripcion"
        margin="dense"
        multiline
        name="description"
        onChange={event => handleChange(event)}
        required
        value={fields.description}
      />
      <SelectField
        fullWidth
        label="Estado"
        name="status"
        onChange={event => handleChange(event)}
        required
        value={fields.status}
      >
        <option value={0}>{"No iniciado"}</option>
        <option value={1}>{"Completado"}</option>
        <option value={2}>{"En proceso"}</option>
      </SelectField>
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

    const delete_progress = selected.map((id) => deleteProject(id));

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
        &nbsp;elementos?
      </DialogContentText>
    </DialogForm>
  );
};

export default () => {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_project, setSelectedProject] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);
  const [project_types, setProjectTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [areas, setAreas] = useState([]);

  const handleEditModalOpen = async (id) => {
    const data = await getProject(id);
    setSelectedProject(data);
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
    getProjectTypes().then(types => setProjectTypes(types));
    getClients().then(clients => setClients(clients));
    getAreas().then(areas => setAreas(areas));
  }, []);

  return (
    <Fragment>
      <Title title={"Proyecto"} />
      <AddModal
        areas={areas}
        clients={clients}
        is_open={is_add_modal_open}
        project_types={project_types}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        areas={areas}
        clients={clients}
        data={selected_project}
        is_open={is_edit_modal_open}
        project_types={project_types}
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
            {/*
              TODO
              Remove hardcoded url
            */}
            <AsyncTable
              data_index={"pk_tipo"}
              data_source={"http://localhost/api/operaciones/proyecto/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Proyectos"}
            />
          </Widget >
        </Grid >
      </Grid >
    </Fragment >
  );
};
