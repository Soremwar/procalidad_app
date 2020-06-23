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
  fetchAreaApi,
  fetchClientApi,
  fetchProjectApi,
  fetchProjectTypeApi,
} from "../../../lib/api/generator.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import SelectField from "../../common/SelectField.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

const getProjectTypes = () => fetchProjectTypeApi().then((x) => x.json());

const getClients = () => fetchClientApi().then((x) => x.json());

const getAreas = () => fetchAreaApi().then((x) => x.json());

const getProject = (id) => fetchProjectApi(id).then((x) => x.json());

const createProject = async (form_data) => {
  return await fetchProjectApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateProject = async (id, form_data) => {
  return await fetchProjectApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteProject = async (id) => {
  return await fetchProjectApi(id, {
    method: "DELETE",
  });
};

const headers = [
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "area", numeric: false, disablePadding: false, label: "Area" },
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
        <option value={"0"}>Cancelado</option>
        <option value={"1"}>Finalizado</option>
        <option value={"2"}>En proceso</option>
        <option value={"3"}>En etapa comercial</option>
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
        <option value={"0"}>Cancelado</option>
        <option value={"1"}>Finalizado</option>
        <option value={"2"}>En proceso</option>
        <option value={"3"}>En etapa comercial</option>
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteProject(id));

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

//TODO
//Switch to context
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
  const [selected_client, setSelectedClient] = useState("");

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

  useEffect(() => {
    updateTable();
  }, [selected_client]);

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
          <Widget noBodyPadding>
            <AsyncTable
              data_source={"operaciones/proyecto/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              search={{
                id_client: selected_client,
              }}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Proyectos"}
            />
          </Widget >
        </Grid >
      </Grid >
    </Fragment >
  );
};
