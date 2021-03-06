import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.ts";
import {
  fetchClientApi,
  fetchPeopleApi,
  fetchProjectApi,
  fetchProjectTypeApi,
  fetchSubAreaApi,
} from "../../../lib/api/generator.js";
import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import SelectField from "../../common/SelectField.jsx";
import Title from "../../common/Title.jsx";

/** @return Promise<Array<{nombre: string}>> */
const getSubAreas = () => fetchSubAreaApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getClients = () => fetchClientApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getPeople = () => fetchPeopleApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getProjectTypes = () => fetchProjectTypeApi().then((x) => x.json());

const getProject = (id) => fetchProjectApi(id).then((x) => x.json());

const createProject = async (
  client,
  description,
  name,
  status,
  sub_area,
  supervisor,
  type,
) =>
  fetchProjectApi("", {
    body: JSON.stringify({
      client,
      description,
      name,
      status,
      sub_area,
      supervisor,
      type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateProject = async (
  id,
  client,
  description,
  name,
  status,
  sub_area,
  supervisor,
  type,
) =>
  fetchProjectApi(id, {
    body: JSON.stringify({
      client,
      description,
      name,
      status,
      sub_area,
      supervisor,
      type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteProject = async (id) =>
  fetchProjectApi(id, {
    method: "DELETE",
  });

const ParameterContext = createContext({
  sub_areas: [],
  clients: [],
  people: [],
  project_types: [],
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
    id: "client",
    numeric: false,
    disablePadding: false,
    label: "Cliente",
    searchable: true,
  },
  {
    id: "sub_area",
    numeric: false,
    disablePadding: false,
    label: "Subárea",
    searchable: true,
  },
  {
    id: "supervisor",
    numeric: false,
    disablePadding: false,
    label: "Supervisor",
    searchable: true,
  },
];

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    sub_areas,
    clients,
    people,
    project_types,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    client: "",
    description: "",
    name: "",
    status: "",
    sub_area: "",
    supervisor: "",
    type: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        client: "",
        description: "",
        name: "",
        status: "",
        sub_area: "",
        supervisor: "",
        type: "",
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createProject(
      fields.client,
      fields.description,
      fields.name,
      fields.status,
      fields.sub_area,
      fields.supervisor,
      fields.type,
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
      <SelectField
        fullWidth
        label="Tipo de proyecto"
        name="type"
        onChange={handleChange}
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
        onChange={handleChange}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Subárea"
        name="sub_area"
        onChange={handleChange}
        required
        value={fields.sub_area}
      >
        {sub_areas.map(({ pk_sub_area, nombre }) => (
          <option key={pk_sub_area} value={pk_sub_area}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Nombre del proyecto"
        fullWidth
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        label="Supervisor"
        name="supervisor"
        onChange={(_e, value) =>
          setFields((prev_state) => ({ ...prev_state, supervisor: value }))}
        options={people}
        required
        value={fields.supervisor}
      />
      <TextField
        autoFocus
        fullWidth
        label="Descripción"
        margin="dense"
        multiline
        name="description"
        onChange={handleChange}
        required
        value={fields.description}
      />
      <SelectField
        fullWidth
        label="Estado"
        name="status"
        onChange={handleChange}
        required
        value={fields.status}
      >
        <option value="0">Cancelado</option>
        <option value="1">Finalizado</option>
        <option value="2">En proceso</option>
        <option value="3">En etapa comercial</option>
      </SelectField>
    </DialogForm>
  );
};

const EditModal = ({
  data,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    sub_areas,
    clients,
    people,
    project_types,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    client: "",
    description: "",
    name: "",
    status: "",
    sub_area: "",
    supervisor: "",
    type: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        client: data.fk_cliente,
        description: data.descripcion,
        name: data.nombre,
        status: data.estado,
        sub_area: data.fk_sub_area,
        supervisor: data.fk_supervisor,
        type: data.fk_tipo_proyecto,
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateProject(
      data.pk_proyecto,
      fields.client,
      fields.description,
      fields.name,
      fields.status,
      fields.sub_area,
      fields.supervisor,
      fields.type,
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
      <SelectField
        disabled
        fullWidth
        label="Tipo de proyecto"
        name="type"
        onChange={handleChange}
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
        onChange={handleChange}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Subárea"
        name="sub_area"
        onChange={handleChange}
        required
        value={fields.sub_area}
      >
        {sub_areas.map(({ pk_sub_area, nombre }) => (
          <option key={pk_sub_area} value={pk_sub_area}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Nombre del proyecto"
        fullWidth
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        label="Supervisor"
        name="supervisor"
        onChange={(_e, value) =>
          setFields((prev_state) => ({ ...prev_state, supervisor: value }))}
        options={people}
        required
        value={fields.supervisor}
      />
      <TextField
        autoFocus
        fullWidth
        label="Descripción"
        margin="dense"
        multiline
        name="description"
        onChange={handleChange}
        required
        value={fields.description}
      />
      <SelectField
        fullWidth
        label="Estado"
        name="status"
        onChange={handleChange}
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
  const [parameters, setParameters] = useState({
    sub_areas: [],
    clients: [],
    people: [],
    project_types: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_project, setSelectedProject] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedProject(await getProject(id));
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
    getSubAreas().then((sub_areas) =>
      setParameters((prev_state) => ({
        ...prev_state,
        sub_areas: sub_areas.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getClients().then((clients) =>
      setParameters((prev_state) => ({
        ...prev_state,
        clients: clients.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getPeople().then((people) =>
      setParameters((prev_state) => ({
        ...prev_state,
        people: people
          .map(({ pk_persona, nombre }) => [pk_persona, nombre])
          .sort(([_x, x], [_y, y]) => x.localeCompare(y)),
      }))
    );
    getProjectTypes().then((project_types) =>
      setParameters((prev_state) => ({
        ...prev_state,
        project_types: project_types.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title="Proyecto" />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_project}
          is_open={is_edit_modal_open}
          setModalOpen={setEditModalOpen}
          updateTable={updateTable}
        />
      </ParameterContext.Provider>
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
        url={"operaciones/proyecto/table"}
      />
    </Fragment>
  );
};
