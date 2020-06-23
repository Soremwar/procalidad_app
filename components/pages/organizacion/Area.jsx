import React, {
  createContext,
  Fragment,
  useContext,
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
  fetchAreaTypesApi,
  fetchPeopleApi,
} from "../../../lib/api/generator.js";

import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

const getAreaTypes = () => fetchAreaTypesApi().then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());

const getArea = (id) => fetchAreaApi(id).then((x) => x.json());

const createArea = async (form_data) => {
  return await fetchAreaApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateArea = async (id, form_data) => {
  return await fetchAreaApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteArea = async (id) => {
  return await fetchAreaApi(id, {
    method: "DELETE",
  });
};

const headers = [
  {
    id: "area_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de Area",
  },
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  {
    id: "supervisor",
    numeric: false,
    disablePadding: false,
    label: "Supervisor",
  },
];

const ParameterContext = createContext({
  area_types: [],
  people: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    area_types,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    area_type: "",
    name: "",
    supervisor: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        area_type: "",
        name: "",
        supervisor: "",
      });
      setLoading(false);
      setError(null);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createArea(new URLSearchParams(fields));

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
        label="Tipo de Area"
        fullWidth
        name="area_type"
        onChange={handleChange}
        required
        value={fields.area_type}
      >
        {area_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        fullWidth
        label="Area"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        name="supervisor"
        label="Supervisor"
        onChange={(_event, value) => setFields(prev_value => ({...prev_value, supervisor: value}))}
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
    area_types,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    area_type: null,
    name: null,
    supervisor: null,
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        area_type: data.fk_tipo_area,
        name: data.nombre,
        supervisor: data.fk_supervisor,
      });
      setLoading(false);
      setError(null);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateArea(data.pk_area, new URLSearchParams(fields));

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
        label="Tipo de Area"
        fullWidth
        name="area_type"
        onChange={handleChange}
        required
        value={fields.area_type}
      >
        {area_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        fullWidth
        label="Area"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        name="supervisor"
        label="Supervisor"
        onChange={(_event, value) => setFields(prev_value => ({...prev_value, supervisor: value}))}
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

    const delete_progress = selected.map((id) => deleteArea(id));

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
    area_types: [],
    people: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_project_type, setSelectedArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);

  const handleEditModalOpen = async (id) => {
    const data = await getArea(id);
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

  //TODO
  //Add error catching for data fetching
  useEffect(() => {
    getAreaTypes().then(area_types => setParameters(prev_state => ({...prev_state, area_types})));
    getPeople().then(people => {
      const entries = people.map(({pk_persona, nombre}) => [pk_persona, nombre]);
      setParameters(prev_state => ({...prev_state, people: entries}));
    });
  }, [false]);

  return (
    <Fragment>
      <Title title={"Area"} />
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
              data_source={"organizacion/area/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Area"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
