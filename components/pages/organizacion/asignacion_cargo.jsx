import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DialogContentText,
  Grid,
} from "@material-ui/core";

import {
  formatResponseJson,
  requestGenerator,
} from "../../../lib/api/request.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import MultipleSelectField from "../../common/MultipleSelectField.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

const fetchAssignationApi = requestGenerator('organizacion/asignacion_cargo');
const fetchPositionApi = requestGenerator('organizacion/cargo');
const fetchSubAreaApi = requestGenerator('organizacion/sub_area');
const fetchPeopleApi = requestGenerator('organizacion/persona');
const fetchRoleApi = requestGenerator('operaciones/rol');

const getPositions = () => fetchPositionApi().then((x) => x.json());
const getSubAreas = () => fetchSubAreaApi().then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getRoles = () => fetchRoleApi().then((x) => x.json());

const getAssignation = (id) => fetchAssignationApi(id).then((x) => x.json());

const createAssignation = async (form_data) => fetchAssignationApi("", {
  body: form_data,
  headers: {
    "Content-Type": "application/json",
  },
  method: "POST",
});

const updateAssignation = async (id, form_data) => fetchAssignationApi(id, {
  body: form_data,
  headers: {
    "Content-Type": "application/json",
  },
  method: "PUT",
});

const deleteAssignation = async (id) => fetchAssignationApi(id, {
  method: "DELETE",
});

const headers = [
  { id: "person", numeric: false, disablePadding: false, label: "Persona" },
  { id: "sub_area", numeric: false, disablePadding: false, label: "Subarea" },
  { id: "position", numeric: false, disablePadding: false, label: "Cargo" },
];

const ParameterContext = createContext({
  people: [],
  sub_areas: [],
  positions: [],
  roles: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    people,
    positions,
    roles,
    sub_areas,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    person: "",
    position: "",
    sub_area: "",
    roles: [],
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = event => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  }

  useEffect(() => {
    if (is_open) {
      setFields({
        person: "",
        position: "",
        sub_area: "",
        roles: [],
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const request = await createAssignation(JSON.stringify(fields));

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
        label="Persona"
        margin="dense"
        name="person"
        onChange={handleChange}
        required
        value={fields.person}
      >
        {people.map(({ pk_persona, nombre }) => (
          <option key={pk_persona} value={pk_persona}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Cargo"
        margin="dense"
        name="position"
        onChange={handleChange}
        required
        value={fields.position}
      >
        {positions.map(({ pk_cargo, nombre }) => (
          <option key={pk_cargo} value={pk_cargo}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Subarea"
        margin="dense"
        name="sub_area"
        onChange={handleChange}
        required
        value={fields.sub_area}
      >
        {sub_areas.map(({ pk_sub_area, nombre }) => (
          <option key={pk_sub_area} value={pk_sub_area}>{nombre}</option>
        ))}
      </SelectField>
      <MultipleSelectField
        data={roles}
        fullWidth
        label="Roles"
        margin="dense"
        name="roles"
        onChange={handleChange}
        value={fields.roles}
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
    people,
    positions,
    roles,
    sub_areas,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    person: "",
    position: "",
    sub_area: "",
    roles: [],
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        person: data.fk_persona,
        position: data.fk_cargo,
        sub_area: data.fk_sub_area,
        roles: data.fk_roles,
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

    const request = await updateAssignation(data.pk_asignacion, JSON.stringify(fields));

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
        label="Persona"
        margin="dense"
        name="person"
        onChange={handleChange}
        required
        value={fields.person}
      >
        {people.map(({ pk_persona, nombre }) => (
          <option key={pk_persona} value={pk_persona}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Cargo"
        margin="dense"
        name="position"
        onChange={handleChange}
        required
        value={fields.position}
      >
        {positions.map(({ pk_cargo, nombre }) => (
          <option key={pk_cargo} value={pk_cargo}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Subarea"
        margin="dense"
        name="sub_area"
        onChange={handleChange}
        required
        value={fields.sub_area}
      >
        {sub_areas.map(({ pk_sub_area, nombre }) => (
          <option key={pk_sub_area} value={pk_sub_area}>{nombre}</option>
        ))}
      </SelectField>
      <MultipleSelectField
        data={roles}
        fullWidth
        label="Roles"
        margin="dense"
        name="roles"
        onChange={handleChange}
        value={fields.roles}
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

    const delete_progress = selected.map((id) => deleteAssignation(id));

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
  const [parameters, setParameters] = useState({
    people: [],
    positions: [],
    sub_areas: [],
    roles: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_project_type, setSelectedArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);

  const handleEditModalOpen = async (id) => {
    const data = await getAssignation(id);
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
    getPositions().then(positions => setParameters(parameters => ({ ...parameters, positions, })));
    getSubAreas().then(sub_areas => setParameters(parameters => ({ ...parameters, sub_areas, })));
    getPeople().then(people => setParameters(parameters => ({ ...parameters, people, })));
    getRoles().then(roles => {
      const data = roles.map(({ pk_rol, nombre }) => [pk_rol, nombre]);
      setParameters(parameters => ({ ...parameters, roles: data, }));
    });
  }, []);

  return (
    <Fragment>
      <Title title={"Asignacion de Cargo"} />
      <ParameterContext.Provider value={parameters}>
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
      </ParameterContext.Provider>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget noBodyPadding>
            <AsyncTable
              data_source={"organizacion/asignacion_cargo/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Asignaciones"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
