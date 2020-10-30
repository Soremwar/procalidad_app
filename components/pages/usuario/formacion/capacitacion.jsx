import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../../lib/api/request.js";
import {
  fetchFormationLevelApi,
  fetchHRTrainingFormation,
  fetchPeopleApi,
  fetchUserTrainingFormation,
} from "../../../../lib/api/generator.js";
import AdvancedSelectField from "../../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import DateField from "../../../common/DateField.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import Title from "../../../common/Title.jsx";
import SelectField from "../../../common/SelectField.jsx";
import ReviewBadge from "../common/ReviewBadge.jsx";
import ReviewForm from "../common/ReviewForm.jsx";
import ReviewerForm from "../common/ReviewerForm.jsx";

const getFormationLevels = () =>
  fetchFormationLevelApi({
    params: {
      formation_type: "Capacitaciones",
    },
  });

/**
 * @param {boolean} list_retired
 * */
const getPeople = (list_retired = false) =>
  fetchPeopleApi({
    params: {
      list_retired,
    },
  });

const getUserTrainingTitle = (id) => fetchUserTrainingFormation(id);
const getPersonTrainingTitle = (id) => fetchHRTrainingFormation(id);

const createTrainingTitle = async (
  end_date,
  formation_level,
  start_date,
  teacher,
  title,
) =>
  fetchUserTrainingFormation("", {
    body: JSON.stringify({
      end_date,
      formation_level,
      start_date,
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
  start_date,
  teacher,
) =>
  fetchUserTrainingFormation(id, {
    body: JSON.stringify({
      end_date,
      start_date,
      teacher,
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

const reviewTrainingTitle = async (
  id,
  approved,
  observations,
) =>
  fetchHRTrainingFormation(id, {
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
    id: "formation_level",
    numeric: false,
    disablePadding: false,
    label: "Nivel de formación",
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
    displayAs: (_, value) => value ? value : "No hay instructor registrado",
    id: "teacher",
    numeric: false,
    disablePadding: false,
    label: "Instructor",
    searchable: true,
  },
];

const person_headers = [
  ...common_headers,
  {
    displayAs: (_, value) => (
      <ReviewBadge status={Number(value) || 0} />
    ),
    id: "review_status",
    numeric: false,
    disablePadding: false,
    searchable: false,
    orderable: false,
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
      fields.start_date,
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
    <ReviewForm
      approved={false}
      comments="&nbsp;"
      helper_text={error}
      loading={is_loading}
      onClose={() => setModalOpen(false)}
      onSubmit={handleSubmit}
      open={is_open}
      title="Crear nuevo"
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
        <option value="0">En curso</option>
        <option value="1">Finalizado</option>
      </SelectField>
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="start_date"
        onChange={handleChange}
        required
        value={fields.start_date}
      />
      {fields.status
        ? (
          <DateField
            fullWidth
            label="Fecha de finalización"
            name="end_date"
            onChange={handleChange}
            required
            value={fields.end_date}
          />
        )
        : null}
      <AdvancedSelectField
        fullWidth
        name="teacher"
        label="Instructor"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, teacher: value }))}
        options={people.sort(([_a, x], [_b, y]) => x.localeCompare(y))}
        value={fields.teacher}
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
    formation_levels,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    approved: false,
    comments: "",
    end_date: "",
    formation_level: "",
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

    const request = await updateTrainingTitle(
      data.id,
      fields.end_date || null,
      fields.start_date,
      fields.teacher || null,
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
        comments: data.observations,
        end_date: data.end_date,
        formation_level: data.formation_level,
        start_date: data.start_date,
        status: !!data.end_date,
        teacher: data.teacher,
        title: data.title,
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
      <SelectField
        disabled
        fullWidth
        label="Nivel de formación"
        name="formation_level"
        value={fields.formation_level}
      >
        {formation_levels
          .sort(({ name: x }, { name: y }) => x.localeCompare(y))
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <TextField
        disabled
        fullWidth
        label="Título"
        name="title"
        value={fields.title}
      />
      <SelectField
        blank_value={false}
        disabled={!!data.end_date}
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
        <option value="0">En curso</option>
        <option value="1">Finalizado</option>
      </SelectField>
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="start_date"
        onChange={handleChange}
        required
        value={fields.start_date}
      />
      {fields.status
        ? (
          <DateField
            fullWidth
            label="Fecha de finalización"
            name="end_date"
            onChange={handleChange}
            required
            value={fields.end_date}
          />
        )
        : null}
      <AdvancedSelectField
        fullWidth
        name="teacher"
        label="Instructor"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, teacher: value }))}
        options={people.sort(([_a, x], [_b, y]) => x.localeCompare(y))}
        value={fields.teacher}
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
  const {
    formation_levels,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    end_date: "",
    formation_level: "",
    start_date: "",
    status: false,
    teacher: "",
    title: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setFields({
        end_date: data.end_date,
        formation_level: data.formation_level,
        start_date: data.start_date,
        status: !!data.end_date,
        teacher: data.teacher,
        title: data.title,
      });
      setLoading(false);
      setError(null);
    }
  }, [open]);

  const handleReview = (approved, observations) => {
    setLoading(true);
    setError(null);
    reviewTrainingTitle(
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
      <SelectField
        fullWidth
        label="Nivel de formación"
        name="formation_level"
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
        label="Título"
        name="title"
        value={fields.title}
      />
      <SelectField
        fullWidth
        label="Estado"
        name="status"
        value={Number(fields.status)}
      >
        <option value="0">En curso</option>
        <option value="1">Finalizado</option>
      </SelectField>
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="start_date"
        value={fields.start_date}
      />
      {fields.status
        ? (
          <DateField
            fullWidth
            label="Fecha de finalización"
            name="end_date"
            value={fields.end_date}
          />
        )
        : null}
      <AdvancedSelectField
        fullWidth
        name="teacher"
        label="Instructor"
        options={people.sort(([_a, x], [_b, y]) => x.localeCompare(y))}
        value={fields.teacher}
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

const getTrainingTitle = (id, review_mode = false) => {
  let request;
  if (review_mode) {
    request = getPersonTrainingTitle(id);
  } else {
    request = getUserTrainingTitle(id);
  }

  return request
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error();
    })
    .catch((e) => {
      console.log("Couldn't load training title", e);
      throw e;
    });
};

export default function Capacitacion({
  review_mode = false,
}) {
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
  const [selected_person, setSelectedPerson] = useState(null);
  const [review_modal_open, setReviewModalOpen] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedTrainingTitle(await getTrainingTitle(id));
    setEditModalOpen(true);
  };

  const handleReviewModalOpen = async (id) => {
    setSelectedTrainingTitle(await getTrainingTitle(id, true));
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
    getPeople(true)
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

    if (!review_mode) {
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
      <Title title="Capacitaciones internas" />
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
          data={selected_training_title}
          is_open={is_edit_modal_open}
          setModalOpen={setEditModalOpen}
          updateTable={updateTable}
        />
        <ReviewModal
          data={selected_training_title}
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
          ? "humanos/formacion/capacitacion/table"
          : "usuario/formacion/capacitacion/table"}
      />
    </Fragment>
  );
}
