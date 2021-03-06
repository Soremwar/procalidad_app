import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../../lib/api/request.ts";
import {
  fetchHRProjectExperience,
  fetchPeopleApi,
  fetchRoleApi,
  fetchUserProjectExperience,
} from "../../../../lib/api/generator.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import CitySelector from "../../../common/CitySelector.jsx";
import DateField from "../../../common/DateField.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import MultipleTextField from "../../../common/MultipleTextField.jsx";
import ReviewBadge from "../common/ReviewBadge.jsx";
import ReviewForm from "../common/ReviewForm.jsx";
import SelectField from "../../../common/SelectField.jsx";
import Title from "../../../common/Title.jsx";
import AdvancedSelectField from "../../../common/AdvancedSelectField";
import ReviewerForm from "../common/ReviewerForm";

const getPeople = () => fetchPeopleApi();
const getRoles = () => fetchRoleApi();

const getProjectExperiences = () => fetchUserProjectExperience();

const getUserProjectExperience = (id) => fetchUserProjectExperience(id);
const getPersonProjectExperience = (id) => fetchHRProjectExperience(id);

const createProjectExperience = async (
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

const reviewProjectExperience = async (
  id,
  approved,
  observations,
) =>
  fetchHRProjectExperience(id, {
    body: JSON.stringify({
      approved,
      observations,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const common_headers = [
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
  {
    displayAs: (_i, value) => `${value} %`,
    id: "participation",
    numeric: false,
    disablePadding: false,
    label: "Participación",
    searchable: true,
  },
];

const person_headers = [
  ...common_headers,
  {
    displayAs: (_, value) => (
      <ReviewBadge status={value} />
    ),
    id: "review_status",
    numeric: false,
    disablePadding: false,
    searchable: false,
    orderable: false,
  },
];

const ParameterContext = createContext({
  roles: [],
  tools_used: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    roles,
    tools_used,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
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
    tools_used: [],
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

    if (!fields.tools_used.length) {
      setError(
        'Por favor llene la casilla "Entorno tecnológico" antes de continuar',
      );
      setLoading(false);
      return;
    }

    const request = await createProjectExperience(
      fields.client_city,
      fields.client_name,
      fields.functions,
      fields.project_contact_name,
      Number(fields.project_contact_phone) || 0,
      fields.project_description,
      fields.project_end_date,
      fields.project_is_internal,
      fields.project_name,
      Number(fields.project_participation) || 0,
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
        tools_used: [],
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  return (
    <ReviewForm
      approved={false}
      comments="&nbsp;"
      helper_text={error}
      loading={is_loading}
      onClose={() => setModalOpen(false)}
      onSubmit={handleSubmit}
      open={is_open}
      title="Crear Nuevo"
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
          maxLength: "1000",
        }}
        label="Funciones"
        multiline
        name="functions"
        onChange={handleChange}
        placeholder="Ej:&#10;Entendimiento de los requisitos técnicos, funcionales y su implementación a través del diseño de la capa de visualización y despliegue."
        rows="3"
        rowsMax="10"
        required
        value={fields.functions}
      />
      <DateField
        fullWidth
        label="Fecha de inicio de participación"
        name="project_start_date"
        onChange={handleChange}
        required
        value={fields.project_start_date}
      />
      <DateField
        fullWidth
        label="Fecha de fin de participación"
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
          min: 0,
          max: 999999999999999,
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
      <MultipleTextField
        fetchSuggestions={async () => tools_used}
        label="Entorno tecnológico"
        max="40"
        placeholder="Herramientas usadas en el proyecto Eg: (ODI, DataStage)"
        required
        setValue={(tools_used) =>
          setFields((prev_state) => ({ ...prev_state, tools_used }))}
        value={fields.tools_used}
      />
      <CitySelector
        setValue={(client_city) => {
          setFields((prev_state) => ({ ...prev_state, client_city }));
        }}
        value={fields.client_city}
      />
    </ReviewForm>
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
    approved: false,
    client_city: "",
    client_name: "",
    comments: "",
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
    tools_used: [],
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

    if (!fields.tools_used.length) {
      setError(
        'Por favor llene la casilla "Entorno tecnológico" antes de continuar',
      );
      setLoading(false);
      return;
    }

    const request = await updateProjectExperience(
      data.id,
      fields.client_city,
      fields.client_name,
      fields.functions,
      fields.project_contact_name,
      Number(fields.project_contact_phone) || 0,
      fields.project_description,
      fields.project_end_date,
      fields.project_is_internal,
      fields.project_name,
      Number(fields.project_participation) || 0,
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
        approved: data.approved,
        client_city: data.client_city,
        client_name: data.client_name,
        comments: data.observations,
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
    <ReviewForm
      approved={fields.approved}
      comments={fields.comments}
      helper_text={error}
      loading={is_loading}
      onClose={() => setModalOpen(false)}
      onSubmit={handleSubmit}
      open={is_open}
      title="Editar"
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
          maxLength: "1000",
        }}
        label="Funciones"
        multiline
        name="functions"
        onChange={handleChange}
        placeholder="Ej:&#10;Entendimiento de los requisitos técnicos, funcionales y su implementación a través del diseño de la capa de visualización y despliegue."
        rows="3"
        rowsMax="10"
        required
        value={fields.functions}
      />
      <DateField
        fullWidth
        label="Fecha de inicio de participación"
        name="project_start_date"
        onChange={handleChange}
        required
        value={fields.project_start_date}
      />
      <DateField
        fullWidth
        label="Fecha de fin de participación"
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
          min: 0,
          max: 999999999999999,
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
      <MultipleTextField
        fetchSuggestions={async () => tools_used}
        label="Entorno tecnológico"
        max="40"
        placeholder="Herramientas usadas en el proyecto Eg: (ODI, DataStage)"
        required
        setValue={(tools_used) =>
          setFields((prev_state) => ({ ...prev_state, tools_used }))}
        value={fields.tools_used}
      />
      <CitySelector
        setValue={(client_city) => {
          setFields((prev_state) => ({ ...prev_state, client_city }));
        }}
        value={fields.client_city}
      />
    </ReviewForm>
  );
};

const ReviewModal = ({
  data,
  onClose,
  open,
  updateTable,
}) => {
  const [fields, setFields] = useState({
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
    tools_used: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setFields({
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
  }, [open]);

  const handleReview = (approved, observations) => {
    setLoading(true);
    setError(null);
    reviewProjectExperience(
      data.id,
      approved,
      observations,
    )
      .then((response) => {
        if (response.ok) {
          updateTable();
          onClose();
          setError(null);
        } else {
          throw new Error();
        }
      })
      .catch((e) => {
        console.error("An error ocurred when reviewing item", e);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  return (
    <ReviewerForm
      helper_text={error}
      loading={loading}
      open={open}
      onReview={handleReview}
      onClose={onClose}
    >
      <TextField
        fullWidth
        label="Cliente"
        name="client_name"
        value={fields.client_name}
      />
      <TextField
        fullWidth
        label="Proyecto"
        name="project_name"
        value={fields.project_name}
      />
      <TextField
        fullWidth
        label="Descripción proyecto"
        name="project_description"
        value={fields.project_description}
      />
      <MultipleTextField
        label="Roles"
        value={fields.roles}
      />
      <TextField
        fullWidth
        label="Funciones"
        multiline
        name="functions"
        rows="3"
        rowsMax="10"
        value={fields.functions}
      />
      <DateField
        fullWidth
        label="Fecha de inicio de participación"
        name="project_start_date"
        value={fields.project_start_date}
      />
      <DateField
        fullWidth
        label="Fecha de fin de participación"
        name="project_end_date"
        value={fields.project_end_date}
      />
      <SelectField
        fullWidth
        label="Proyecto Procalidad"
        name="project_is_internal"
        value={Number(fields.project_is_internal)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      <TextField
        fullWidth
        label="Nombre de contacto"
        name="project_contact_name"
        value={fields.project_contact_name}
      />
      <TextField
        fullWidth
        label="Numero de contacto"
        name="project_contact_phone"
        type="number"
        value={fields.project_contact_phone}
      />
      <TextField
        fullWidth
        label="% Participación"
        name="project_participation"
        type="number"
        value={fields.project_participation}
      />
      <MultipleTextField
        label="Entorno tecnológico"
        value={fields.tools_used}
      />
      <CitySelector
        setValue={() => {}}
        value={fields.client_city}
      />
    </ReviewerForm>
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

const getProjectExperience = (id, review_mode = false) => {
  let request;
  if (review_mode) {
    request = getPersonProjectExperience(id);
  } else {
    request = getUserProjectExperience(id);
  }

  return request
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error();
    })
    .catch((e) => {
      console.log("Couldnt load project experience", e);
      throw e;
    });
};

export default function Proyecto({
  review_mode = false,
}) {
  const [parameters, setParameters] = useState({
    roles: [],
    tools_used: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [laboral_experience, setSelectedLaboralExperience] = useState({});
  const [selected, setSelected] = useState([]);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);
  const [people, setPeople] = useState([]);
  const [selected_person, setSelectedPerson] = useState(null);
  const [review_modal_open, setReviewModalOpen] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedLaboralExperience(await getProjectExperience(id));
    setEditModalOpen(true);
  };

  const handleReviewModalOpen = async (id) => {
    setSelectedLaboralExperience(await getProjectExperience(id, true));
    setReviewModalOpen(true);
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
    getProjectExperiences()
      .then(async (response) => {
        if (response.ok) {
          const tools_used = await response.json()
            .then((experience) => {
              return [...new Set(experience.map((x) => x.tools_used))]
                .flat()
                .sort((a, b) => a.localeCompare(b));
            });
          setParameters((prev_state) => ({ ...prev_state, tools_used }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the roles"));

    if (review_mode) {
      getPeople()
        .then(async (response) => {
          if (response.ok) {
            const people = await response.json()
              .then((raw_people) =>
                raw_people.map(({ pk_persona, nombre }) => [pk_persona, nombre])
              );
            setParameters((prev_state) => ({ ...prev_state, people }));
          } else {
            throw new Error();
          }
        })
        .catch(() => console.error("Couldnt load the formation levels"));
    } else {
      updateTable();
    }
  }, []);

  useEffect(() => {
    if (review_mode && selected_person) {
      updateTable();
    }
  }, [selected_person]);

  return (
    <Fragment>
      <Title title="Experiencia en proyectos - servicios" />
      {review_mode
        ? (
          <Fragment>
            <AdvancedSelectField
              fullWidth
              label="Persona"
              onChange={(_event, value) => setSelectedPerson(value)}
              options={parameters.people}
              value={selected_person}
            />
            <br />
            <br />
          </Fragment>
        )
        : null}
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
        <ReviewModal
          data={laboral_experience}
          open={review_modal_open}
          onClose={() => setReviewModalOpen(false)}
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
        columns={review_mode ? common_headers : person_headers}
        onAddClick={!review_mode && (() => setAddModalOpen(true))}
        onEditClick={(id) =>
          review_mode ? handleReviewModalOpen(id) : handleEditModalOpen(id)}
        onDeleteClick={!review_mode &&
          ((selected) => handleDeleteModalOpen(selected))}
        onTableUpdate={() => setTableShouldUpdate(false)}
        search={review_mode
          ? {
            person: selected_person,
            review_status: 2,
          }
          : {}}
        update_table={tableShouldUpdate}
        url={review_mode
          ? "humanos/experiencia/proyecto/table"
          : "usuario/experiencia/proyecto/table"}
      />
    </Fragment>
  );
}
