import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DialogContentText,
  TextField,
} from "@material-ui/core";
import {
  formatResponseJson,
} from "../../../../lib/api/request.js";
import {
  fetchRoleApi,
  fetchUserProjectExperience,
} from "../../../../lib/api/generator.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import CitySelector from "../../../common/CitySelector.jsx";
import DateField from "../../../common/DateField.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import MultipleTextField from "../../../common/MultipleTextField.jsx";
import Title from "../../../common/Title.jsx";
import SelectField from "../../../common/SelectField.jsx";

const getRoles = () => fetchRoleApi();

const getProjectExperience = (id) => fetchUserProjectExperience(id);

const createProjectExperience = async (
  client_address,
  client_city,
  client_name,
  functions,
  project_contact_name,
  project_contact_phone,
  project_description,
  project_end_date,
  project_is_internal,
  project_name,
  project_participation,
  project_start_date,
  roles,
  tools_used,
) =>
  fetchUserProjectExperience("", {
    body: JSON.stringify({
      client_address,
      client_city,
      client_name,
      functions,
      project_contact_name,
      project_contact_phone,
      project_description,
      project_end_date,
      project_is_internal,
      project_name,
      project_participation,
      project_start_date,
      roles,
      tools_used,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateProjectExperience = async (
  id,
  client_address,
  client_city,
  client_name,
  functions,
  project_contact_name,
  project_contact_phone,
  project_description,
  project_end_date,
  project_is_internal,
  project_name,
  project_participation,
  project_start_date,
  roles,
  tools_used,
) =>
  fetchUserProjectExperience(id, {
    body: JSON.stringify({
      client_address,
      client_city,
      client_name,
      functions,
      project_contact_name,
      project_contact_phone,
      project_description,
      project_end_date,
      project_is_internal,
      project_name,
      project_participation,
      project_start_date,
      roles,
      tools_used,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteProjectExperience = async (id) =>
  fetchUserProjectExperience(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "client",
    numeric: false,
    disablePadding: false,
    label: "Cliente",
    searchable: true,
  },
  {
    id: "project",
    numeric: false,
    disablePadding: false,
    label: "Proyecto",
    searchable: true,
  },
  {
    id: "duration",
    numeric: false,
    disablePadding: false,
    label: "Duración(meses)",
    searchable: true,
  },
];

const ParameterContext = createContext({
  roles: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    roles,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    client_address: "",
    client_city: "",
    client_name: "",
    functions: "",
    project_contact_name: "",
    project_contact_phone: "",
    project_description: "",
    project_end_date: "",
    project_is_internal: false,
    project_name: "",
    project_participation: 0,
    project_start_date: "",
    roles: [],
    tools_used: "",
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

    if (!fields.roles.length) {
      setError('Por favor llene la casilla "roles" antes de continuar');
      setLoading(false);
      return;
    }

    const request = await createProjectExperience(
      fields.client_address,
      fields.client_city,
      fields.client_name,
      fields.functions,
      fields.project_contact_name,
      fields.project_contact_phone,
      fields.project_description,
      fields.project_end_date,
      fields.project_is_internal,
      fields.project_name,
      isNaN(fields.project_participation)
        ? 0
        : Number(fields.project_participation),
      fields.project_start_date,
      fields.roles,
      fields.tools_used,
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
        client_address: "",
        client_city: "",
        client_name: "",
        functions: "",
        project_contact_name: "",
        project_contact_phone: "",
        project_description: "",
        project_end_date: "",
        project_is_internal: false,
        project_name: "",
        project_participation: 0,
        project_start_date: "",
        roles: [],
        tools_used: "",
      });
      setLoading(false);
      setError(null);
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
        fullWidth
        inputProps={{
          maxLength: "255",
        }}
        label="Cliente"
        name="client_name"
        onChange={(e) => {
          const client_name = e.target.value.toUpperCase();
          setFields((prev_state) => ({ ...prev_state, client_name }));
        }}
        required
        value={fields.client_name}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "200",
        }}
        label="Proyecto"
        name="project_name"
        onChange={handleChange}
        required
        value={fields.project_name}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "100",
        }}
        label="Descripción proyecto"
        name="project_description"
        onChange={handleChange}
        required
        value={fields.project_description}
      />
      <MultipleTextField
        fetchSuggestions={async () => roles}
        label="Roles"
        max="20"
        required
        setValue={(roles) =>
          setFields((prev_state) => ({ ...prev_state, roles }))}
        value={fields.roles}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "100",
        }}
        label="Funciones"
        name="functions"
        onChange={handleChange}
        required
        value={fields.functions}
      />
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="project_start_date"
        onChange={handleChange}
        required
        value={fields.project_start_date}
      />
      <DateField
        fullWidth
        label="Fecha de finalización"
        name="project_end_date"
        onChange={handleChange}
        required
        value={fields.project_end_date}
      />
      <SelectField
        blank_value={false}
        fullWidth
        label="Proyecto Procalidad"
        name="project_is_internal"
        onChange={(e) => {
          const project_is_internal = Boolean(Number(e.target.value));
          setFields((prev_state) => ({ ...prev_state, project_is_internal }));
        }}
        required
        value={Number(fields.project_is_internal)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      <TextField
        fullWidth
        inputProps={{
          maxLength: "100",
        }}
        label="Dirección"
        name="client_address"
        onChange={handleChange}
        required
        value={fields.client_address}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "255",
        }}
        label="Nombre de contacto"
        name="project_contact_name"
        onChange={handleChange}
        required
        value={fields.project_contact_name}
      />
      <TextField
        fullWidth
        inputProps={{
          min: "0",
        }}
        label="Numero de contacto"
        name="project_contact_phone"
        onChange={handleChange}
        required
        type="number"
        value={fields.project_contact_phone}
      />
      <TextField
        fullWidth
        inputProps={{
          min: "0",
          max: "100",
          step: "0.1",
        }}
        label="% Participación"
        name="project_participation"
        onChange={handleChange}
        required
        type="number"
        value={fields.project_participation}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "1000",
        }}
        multiline
        label="Entorno tecnológico"
        name="tools_used"
        onChange={handleChange}
        required
        rows={3}
        rowsMax={10}
        value={fields.tools_used}
      />
      <CitySelector
        setValue={(client_city) => {
          setFields((prev_state) => ({ ...prev_state, client_city }));
        }}
        value={fields.client_city}
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
  const {
    roles,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    client_address: "",
    client_city: "",
    client_name: "",
    functions: "",
    project_contact_name: "",
    project_contact_phone: "",
    project_description: "",
    project_end_date: "",
    project_is_internal: false,
    project_name: "",
    project_participation: 0,
    project_start_date: "",
    roles: [],
    tools_used: "",
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

    if (!fields.roles.length) {
      setError('Por favor llene la casilla "roles" antes de continuar');
      setLoading(false);
      return;
    }

    const request = await updateProjectExperience(
      data.id,
      fields.client_address,
      fields.client_city,
      fields.client_name,
      fields.functions,
      fields.project_contact_name,
      fields.project_contact_phone,
      fields.project_description,
      fields.project_end_date,
      fields.project_is_internal,
      fields.project_name,
      isNaN(fields.project_participation)
        ? 0
        : Number(fields.project_participation),
      fields.project_start_date,
      fields.roles,
      fields.tools_used,
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
        client_address: data.client_address,
        client_city: data.client_city,
        client_name: data.client_name,
        functions: data.functions,
        project_contact_name: data.project_contact_name,
        project_contact_phone: data.project_contact_phone,
        project_description: data.project_description,
        project_end_date: data.project_end_date,
        project_is_internal: data.project_is_internal,
        project_name: data.project_name,
        project_participation: data.project_participation,
        project_start_date: data.project_start_date,
        roles: data.roles,
        tools_used: data.tools_used,
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

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
        inputProps={{
          maxLength: "255",
        }}
        label="Cliente"
        name="client_name"
        onChange={(e) => {
          const client_name = e.target.value.toUpperCase();
          setFields((prev_state) => ({ ...prev_state, client_name }));
        }}
        required
        value={fields.client_name}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "200",
        }}
        label="Proyecto"
        name="project_name"
        onChange={handleChange}
        required
        value={fields.project_name}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "100",
        }}
        label="Descripción proyecto"
        name="project_description"
        onChange={handleChange}
        required
        value={fields.project_description}
      />
      <MultipleTextField
        fetchSuggestions={async () => roles}
        label="Roles"
        max="20"
        required
        setValue={(roles) =>
          setFields((prev_state) => ({ ...prev_state, roles }))}
        value={fields.roles}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "100",
        }}
        label="Funciones"
        name="functions"
        onChange={handleChange}
        required
        value={fields.functions}
      />
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="project_start_date"
        onChange={handleChange}
        required
        value={fields.project_start_date}
      />
      <DateField
        fullWidth
        label="Fecha de finalización"
        name="project_end_date"
        onChange={handleChange}
        required
        value={fields.project_end_date}
      />
      <SelectField
        blank_value={false}
        fullWidth
        label="Proyecto Procalidad"
        name="project_is_internal"
        onChange={(e) => {
          const project_is_internal = Boolean(Number(e.target.value));
          setFields((prev_state) => ({ ...prev_state, project_is_internal }));
        }}
        required
        value={Number(fields.project_is_internal)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      <TextField
        fullWidth
        inputProps={{
          maxLength: "100",
        }}
        label="Dirección"
        name="client_address"
        onChange={handleChange}
        required
        value={fields.client_address}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "255",
        }}
        label="Nombre de contacto"
        name="project_contact_name"
        onChange={handleChange}
        required
        value={fields.project_contact_name}
      />
      <TextField
        fullWidth
        inputProps={{
          min: "0",
        }}
        label="Numero de contacto"
        name="project_contact_phone"
        onChange={handleChange}
        required
        type="number"
        value={fields.project_contact_phone}
      />
      <TextField
        fullWidth
        inputProps={{
          min: "0",
          max: "100",
          step: "0.1",
        }}
        label="% Participación"
        name="project_participation"
        onChange={handleChange}
        required
        type="number"
        value={fields.project_participation}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "1000",
        }}
        multiline
        label="Entorno tecnológico"
        name="tools_used"
        onChange={handleChange}
        required
        rows={3}
        rowsMax={10}
        value={fields.tools_used}
      />
      <CitySelector
        setValue={(client_city) => {
          setFields((prev_state) => ({ ...prev_state, client_city }));
        }}
        value={fields.client_city}
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

    const delete_progress = selected.map((id) => deleteProjectExperience(id));

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
      title={"Eliminar Elementos"}
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
    roles: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [laboral_experience, setSelectedLaboralExperience] = useState({});
  const [selected, setSelected] = useState([]);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getProjectExperience(id)
      .then(async (response) => {
        if (response.ok) {
          setSelectedLaboralExperience(await response.json());
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch((e) => console.error("Couldnt load the laboral experience"));
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    getRoles()
      .then(async (response) => {
        if (response.ok) {
          const roles = await response.json();
          setParameters((prev_state) => ({
            ...prev_state,
            roles: roles
              .map((x) => x.nombre)
              .sort((a, b) => a.localeCompare(b)),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the roles"));
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Experiencia en proyectos - servicios"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={laboral_experience}
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
        url={"usuario/experiencia/proyecto/table"}
      />
    </Fragment>
  );
};
