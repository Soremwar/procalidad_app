import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.js";
import {
  fetchPeopleApi,
  fetchPositionApi,
  fetchPositionAssignationApi as fetchAssignationApi,
  fetchRoleApi,
  fetchSubAreaApi,
} from "../../../lib/api/generator.js";
import { formatDateToStandardString } from "../../../lib/date/mod.js";
import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import MultipleSelectField from "../../common/MultipleSelectField.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";

/** @return Promise<Array<{nombre: string}>> */
const getPositions = () => fetchPositionApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getSubAreas = () => fetchSubAreaApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getPeople = () => fetchPeopleApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getRoles = () => fetchRoleApi().then((x) => x.json());

const getAssignation = (id) => fetchAssignationApi(id).then((x) => x.json());

const createAssignation = async (
  person,
  position,
  roles,
  sub_area,
  validity,
) =>
  fetchAssignationApi("", {
    body: JSON.stringify({
      person,
      position,
      roles,
      sub_area,
      validity,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateAssignation = async (
  id,
  person,
  position,
  roles,
  sub_area,
  validity,
) =>
  fetchAssignationApi(id, {
    body: JSON.stringify({
      person,
      position,
      roles,
      sub_area,
      validity,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteAssignation = async (id) =>
  fetchAssignationApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "person",
    numeric: false,
    disablePadding: false,
    label: "Persona",
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
    id: "position",
    numeric: false,
    disablePadding: false,
    label: "Cargo",
    searchable: true,
  },
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
    roles: [],
    sub_area: "",
    validity: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  useEffect(() => {
    if (is_open) {
      setFields({
        person: "",
        position: "",
        roles: [],
        sub_area: "",
        validity: [],
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const request = await createAssignation(
      fields.person,
      fields.position,
      fields.roles,
      fields.sub_area,
      fields.validity,
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
      <AdvancedSelectField
        fullWidth
        label="Persona"
        name="person"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, person: value }))}
        options={people}
        required
        value={fields.person}
      />
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
        label="Subárea"
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
      <TextField
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        label="Inicio de asignacion"
        margin="dense"
        name="validity"
        onChange={handleChange}
        required
        type="date"
        value={fields.validity}
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
    roles: [],
    sub_area: "",
    validity: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        person: data.fk_persona,
        position: data.fk_cargo,
        roles: data.fk_roles,
        sub_area: data.fk_sub_area,
        validity: formatDateToStandardString(new Date(data.fec_vigencia)),
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

    const request = await updateAssignation(
      data.pk_asignacion,
      fields.person,
      fields.position,
      fields.roles,
      fields.sub_area,
      fields.validity,
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
      <AdvancedSelectField
        disabled
        fullWidth
        label="Persona"
        name="person"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, person: value }))}
        options={people}
        required
        value={fields.person}
      />
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
        label="Subárea"
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
      <TextField
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        label="Inicio de asignacion"
        margin="dense"
        name="validity"
        onChange={handleChange}
        required
        type="date"
        value={fields.validity}
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
    people: [],
    positions: [],
    sub_areas: [],
    roles: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_position_assignation, setSelectedPositionAssignation] =
    useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedPositionAssignation(await getAssignation(id));
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
    getPositions().then((positions) =>
      setParameters((parameters) => ({
        ...parameters,
        positions: positions.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getSubAreas().then((sub_areas) =>
      setParameters((parameters) => ({
        ...parameters,
        sub_areas: sub_areas.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getPeople().then((people) =>
      setParameters((parameters) => ({
        ...parameters,
        people: people
          .map(({ pk_persona, nombre }) => [pk_persona, nombre])
          .sort(([_x, x], [_y, y]) => x.localeCompare(y)),
      }))
    );
    getRoles().then((roles) =>
      setParameters((parameters) => ({
        ...parameters,
        roles: roles
          .map(({ pk_rol, nombre }) => [pk_rol, nombre])
          .sort(([_x, x], [_y, y]) => x.localeCompare(y)),
      }))
    );
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Asignación de cargo"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_position_assignation}
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
        url={"organizacion/asignacion_cargo/table"}
      />
    </Fragment>
  );
};
