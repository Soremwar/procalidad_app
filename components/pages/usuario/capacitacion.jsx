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
} from "../../../lib/api/request.js";
import {
  fetchFormationLevelApi,
  fetchUserTrainingFormation,
  fetchPeopleApi,
} from "../../../lib/api/generator.js";
import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DateField from "../../common/DateField.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";

const getFormationLevels = () =>
  fetchFormationLevelApi({
    formation_type: "Capacitaciones",
  });

const getPeople = () => fetchPeopleApi();

const getTrainingTitle = (id) => fetchUserTrainingFormation(id);

const createTrainingTitle = async (
  end_date,
  formation_level,
  institution,
  start_date,
  status,
  teacher,
  title,
) =>
  fetchUserTrainingFormation("", {
    body: JSON.stringify({
      end_date,
      formation_level,
      institution,
      start_date,
      status,
      teacher,
      title,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateTrainingTitle = async (
  id,
  end_date,
  formation_level,
  institution,
  start_date,
  status,
  teacher,
  title,
) =>
  fetchUserTrainingFormation(id, {
    body: JSON.stringify({
      end_date,
      formation_level,
      institution,
      start_date,
      status,
      teacher,
      title,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteTrainingTitle = async (id) =>
  fetchUserTrainingFormation(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "formation_level",
    numeric: false,
    disablePadding: false,
    label: "Nivel de formación",
    searchable: true,
  },
  {
    id: "institution",
    numeric: false,
    disablePadding: false,
    label: "Institución",
    searchable: true,
  },
  {
    id: "title",
    numeric: false,
    disablePadding: false,
    label: "Titulo",
    searchable: true,
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "Estado",
    searchable: true,
  },
  {
    id: "teacher",
    numeric: false,
    disablePadding: false,
    label: "Instructor",
    searchable: true,
  },
];

const ParameterContext = createContext({
  formation_levels: [],
  people: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    formation_levels,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    end_date: "",
    formation_level: "",
    institution: "",
    start_date: "",
    status: false,
    teacher: "",
    title: "",
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

    const request = await createTrainingTitle(
      fields.end_date || null,
      fields.formation_level,
      fields.institution,
      fields.start_date,
      fields.status,
      fields.teacher || null,
      fields.title,
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
        end_date: "",
        formation_level: "",
        institution: "",
        start_date: "",
        status: false,
        teacher: "",
        title: "",
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
      <SelectField
        fullWidth
        label="Nivel de formación"
        name="formation_level"
        onChange={handleChange}
        required
        value={fields.formation_level}
      >
        {formation_levels
          .sort(({ name: x }, { name: y }) => x.localeCompare(y))
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <TextField
        fullWidth
        InputProps={{
          inputProps: {
            maxLength: "50",
          },
        }}
        label="Título"
        name="title"
        onChange={handleChange}
        required
        value={fields.title}
      />
      <TextField
        fullWidth
        InputProps={{
          inputProps: {
            maxLength: "50",
          },
        }}
        label="Institución"
        name="institution"
        onChange={handleChange}
        required
        value={fields.institution}
      />
      <SelectField
        blank_value={false}
        fullWidth
        label="Estado"
        name="status"
        onChange={(event) => {
          const status = Boolean(Number(event.target.value));
          setFields((prev_state) => ({ ...prev_state, status }));
        }}
        required
        value={Number(fields.status)}
      >
        <option value="0">Finalizado</option>
        <option value="1">En curso</option>
      </SelectField>
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="start_date"
        onChange={handleChange}
        required
        value={fields.start_date}
      />
      <DateField
        disabled={fields.status}
        fullWidth
        label="Fecha de finalización"
        name="end_date"
        onChange={handleChange}
        required
        value={fields.end_date}
      />
      <AdvancedSelectField
        fullWidth
        name="teacher"
        label="Instructor"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, teacher: value }))}
        options={people.sort(([_a, x], [_b, y]) => x.localeCompare(y))}
        value={fields.teacher}
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
    formation_levels,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    end_date: "",
    formation_level: "",
    institution: "",
    start_date: "",
    status: "",
    teacher: "",
    title: "",
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

    const request = await updateTrainingTitle(
      data.id,
      fields.end_date || null,
      fields.formation_level,
      fields.institution,
      fields.start_date,
      fields.status,
      fields.teacher || null,
      fields.title,
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
        end_date: data.end_date,
        formation_level: data.formation_level,
        institution: data.institution,
        start_date: data.start_date,
        status: data.status,
        teacher: data.teacher,
        title: data.title,
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
      <SelectField
        fullWidth
        label="Nivel de formación"
        name="formation_level"
        onChange={handleChange}
        required
        value={fields.formation_level}
      >
        {formation_levels
          .sort(({ name: x }, { name: y }) => x.localeCompare(y))
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <TextField
        fullWidth
        InputProps={{
          inputProps: {
            maxLength: "50",
          },
        }}
        label="Título"
        name="title"
        onChange={handleChange}
        required
        value={fields.title}
      />
      <TextField
        fullWidth
        InputProps={{
          inputProps: {
            maxLength: "50",
          },
        }}
        label="Institución"
        name="institution"
        onChange={handleChange}
        required
        value={fields.institution}
      />
      <SelectField
        blank_value={false}
        fullWidth
        label="Estado"
        name="status"
        onChange={(event) => {
          const status = Boolean(Number(event.target.value));
          setFields((prev_state) => ({ ...prev_state, status }));
        }}
        required
        value={Number(fields.status)}
      >
        <option value="0">Finalizado</option>
        <option value="1">En curso</option>
      </SelectField>
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="start_date"
        onChange={handleChange}
        required
        value={fields.start_date}
      />
      <DateField
        disabled={fields.status}
        fullWidth
        label="Fecha de finalización"
        name="end_date"
        onChange={handleChange}
        required
        value={fields.end_date}
      />
      <AdvancedSelectField
        fullWidth
        name="teacher"
        label="Instructor"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, teacher: value }))}
        options={people.sort(([_a, x], [_b, y]) => x.localeCompare(y))}
        value={fields.teacher}
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

    const delete_progress = selected.map((id) => deleteTrainingTitle(id));

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
    formation_levels: [],
    people: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected_training_title, setSelectedTrainingTitle] = useState({});
  const [selected, setSelected] = useState([]);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getTrainingTitle(id)
      .then(async (response) => {
        if (response.ok) {
          setSelectedTrainingTitle(await response.json());
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch((e) => console.error("Couldnt load the training title"));
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    getFormationLevels()
      .then(async (response) => {
        if (response.ok) {
          const formation_levels = await response.json();
          setParameters((prev_state) => ({ ...prev_state, formation_levels }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the formation levels"));
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
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Capacitaciones internas"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_training_title}
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
        url={"usuario/formacion/capacitacion/table"}
      />
    </Fragment>
  );
};
