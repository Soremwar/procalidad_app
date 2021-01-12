import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.ts";
import {
  fetchAccessApi,
  fetchPeopleApi,
  fetchProfileApi,
} from "../../../lib/api/generator.js";

import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import MultipleSelectField from "../../common/MultipleSelectField.jsx";
import Title from "../../common/Title.jsx";

const getPeople = () => fetchPeopleApi();
const getProfiles = () => fetchProfileApi();

const getAccess = (id) => fetchAccessApi(id).then((x) => x.json());

const createAccess = async (form_data) =>
  fetchAccessApi("", {
    body: form_data,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateAccess = async (id, form_data) =>
  fetchAccessApi(id, {
    body: form_data,
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteAccess = async (id) =>
  fetchAccessApi(id, {
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
    id: "profiles",
    numeric: false,
    disablePadding: false,
    label: "Accesos",
    searchable: true,
  },
];

const ParameterContext = createContext({
  people: [],
  profiles: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    people,
    profiles,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    person: "",
    profiles: [],
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        person: "",
        profiles: [],
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

    const request = await createAccess(JSON.stringify(fields));

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
        name="person"
        label="Persona"
        fullWidth
        onChange={(_e, value) =>
          setFields((prev_state) => ({ ...prev_state, person: value }))}
        options={people}
        required
        value={fields.person}
      />
      <MultipleSelectField
        name="profiles"
        label="Accesos"
        fullWidth
        onChange={handleChange}
        data={profiles}
        required
        value={fields.profiles}
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
    profiles,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    person: "",
    profiles: [],
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        person: data.person,
        profiles: data.profiles,
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

    const request = await updateAccess(
      data.person,
      JSON.stringify(fields),
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
        name="person"
        label="Persona"
        fullWidth
        onChange={(_e, value) =>
          setFields((prev_state) => ({ ...prev_state, person: value }))}
        options={people}
        required
        value={fields.person}
      />
      <MultipleSelectField
        name="profiles"
        label="Accesos"
        fullWidth
        onChange={handleChange}
        data={profiles}
        required
        value={fields.profiles}
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

    const delete_progress = selected.map((id) => deleteAccess(id));

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
      title={"Eliminar"}
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
    profiles: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_access, setSelectedAccess] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getAccess(id).then((access) => setSelectedAccess(access));
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
    getPeople()
      .then(async (response) => {
        if (response.ok) {
          /** @type {Array<{pk_persona: number, nombre: string}>} person */
          const people = await response.json();
          setParameters((prev_state) => ({
            ...prev_state,
            people: people
              .map(({ pk_persona, nombre }) => [pk_persona, nombre])
              .sort(([_x, x], [_y, y]) => x.localeCompare(y)),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Coldnt load people"));
    getProfiles()
      .then(async (response) => {
        if (response.ok) {
          /** @type {Array<{id: number, name: string}>} person */
          const profiles = await response.json();
          setParameters((prev_state) => ({
            ...prev_state,
            profiles: profiles
              .map(({ id, name }) => [id, name])
              .sort(([_x, x], [_y, y]) => x.localeCompare(y)),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.log("Couldn't load profiles"));
  }, []);

  return (
    <Fragment>
      <Title title={"Acceso"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_access}
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
        url={"maestro/acceso/table"}
      />
    </Fragment>
  );
};
