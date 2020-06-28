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
  TextField,
} from "@material-ui/core";

import {
  formatResponseJson,
} from "../../../lib/api/request.js";
import {
  fetchAreaTypesApi,
  fetchPeopleApi,
} from "../../../lib/api/generator.js";

import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

const getPeople = () => fetchPeopleApi().then((x) => x.json());

const getProjectType = (id) => fetchAreaTypesApi(id).then((x) => x.json());

const createProjectType = async (form_data) => {
  return await fetchAreaTypesApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateProjectType = async (id, form_data) => {
  return await fetchAreaTypesApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteProjectType = async (id) => {
  return await fetchAreaTypesApi(id, {
    method: "DELETE",
  });
};

const headers = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Nombre",
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

const ParameterContext = createContext({
  people: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    supervisor: "",
    name: "",
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

    const request = await createProjectType(new URLSearchParams(fields));

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
        supervisor: "",
        name: "",
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
        label="Tipo de Area"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        label="Supervisor"
        name="supervisor"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, supervisor: value }))}
        options={people}
        required
        value={fields.supervisor}
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
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    name: "",
    supervisor: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: data.nombre,
        supervisor: data.fk_supervisor,
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

    const request = await updateProjectType(
      data.pk_tipo,
      new URLSearchParams(fields),
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
      <TextField
        fullWidth
        label="Tipo de Area"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        label="Supervisor"
        name="supervisor"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, supervisor: value }))}
        options={people}
        required
        value={fields.supervisor}
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

    const delete_progress = selected.map((id) => deleteProjectType(id));

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
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_project_type, setSelectedProjectType] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    const data = await getProjectType(id);
    setSelectedProjectType(data);
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
    getPeople().then((people) => {
      const entries = people.map((
        { pk_persona, nombre },
      ) => [pk_persona, nombre]);
      setParameters((prev_state) => ({ ...prev_state, people: entries }));
    });
    updateTable();
  }, [false]);

  return (
    <Fragment>
      <Title title={"Tipo de Area"} />
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
      </ParameterContext.Provider>
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
              onTableUpdate={() => setTableShouldUpdate(false)}
              update_table={tableShouldUpdate}
              url={"organizacion/tipo_area/table"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
