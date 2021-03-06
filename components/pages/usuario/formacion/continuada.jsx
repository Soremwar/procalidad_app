import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText, Grid, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../../lib/api/request.ts";
import {
  fetchFormationLevelApi,
  fetchHRContinuousFormation,
  fetchPeopleApi,
  fetchUserContinuousFormation,
} from "../../../../lib/api/generator.js";
import { formatDateToStringDatetime } from "../../../../lib/date/mod.js";
import AdvancedSelectField from "../../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import DownloadButton from "../../../common/DownloadButton.jsx";
import DateField from "../../../common/DateField.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import FileField from "../../../common/FileField.jsx";
import FileReviewDialog from "../common/FileReviewDialog.jsx";
import ReviewBadge from "../common/ReviewBadge.jsx";
import ReviewDialog from "../common/ReviewDialog.jsx";
import ReviewForm from "../common/ReviewForm.jsx";
import ReviewerForm from "../common/ReviewerForm.jsx";
import SelectField from "../../../common/SelectField.jsx";
import Title from "../../../common/Title.jsx";

const getFormationLevels = () =>
  fetchFormationLevelApi({
    params: {
      formation_type: "Continuada",
    },
  });

const getPeople = () => fetchPeopleApi();

const getUserContinuousTitle = (id) => fetchUserContinuousFormation(id);
const getPersonContinuousTitle = (id) => fetchHRContinuousFormation(id);

const createContinuousTitle = async (
  end_date,
  formation_level,
  institution,
  start_date,
  title,
) =>
  fetchUserContinuousFormation("", {
    body: JSON.stringify({
      end_date,
      formation_level,
      institution,
      start_date,
      title,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateContinuousTitle = async (
  id,
  end_date,
  institution,
  start_date,
) =>
  fetchUserContinuousFormation(id, {
    body: JSON.stringify({
      end_date,
      institution,
      start_date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteContinuousTitle = async (id) =>
  fetchUserContinuousFormation(id, {
    method: "DELETE",
  });

const reviewContinuousTitle = async (
  id,
  approved,
  observations,
) =>
  fetchHRContinuousFormation(id, {
    body: JSON.stringify({
      approved,
      observations,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const uploadCertificate = async (
  id,
  name,
  file,
) => {
  const data = new FormData();
  data.append(name, file);
  return fetchUserContinuousFormation(`certificado/${id}`, {
    body: data,
    method: "PUT",
  });
};

const common_headers = [
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
];

const person_headers = [
  ...common_headers,
  {
    displayAs: (id, value, reloadTable) => (
      <Grid container justify="center">
        <Grid item md={6} xs={12}>
          <FileUploader
            file_parameters={value}
            row_id={id}
            reloadTable={reloadTable}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <DownloadButton
            disabled={!value.id}
            href={`/api/archivos/generico/${value.id}`}
          />
        </Grid>
      </Grid>
    ),
    id: "file",
    numeric: false,
    disablePadding: false,
    label: "Certificado",
    searchable: false,
    orderable: false,
  },
  {
    displayAs: (_, value) => {
      return value
        ? formatDateToStringDatetime(value)
        : "No se ha cargado certificado";
    },
    id: "upload_date",
    numeric: false,
    disablePadding: false,
    label: "Fecha de carga",
    searchable: true,
  },
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

const review_headers = [
  ...common_headers,
  {
    displayAs: (id, value) => (
      <DownloadButton
        disabled={!value.id}
        href={`/api/archivos/generico/${value.id}`}
      />
    ),
    id: "file",
    numeric: false,
    disablePadding: false,
    label: "Certificado",
    searchable: false,
    orderable: false,
  },
];

const ParameterContext = createContext({
  formation_levels: [],
});

const FileUploader = ({
  file_parameters,
  reloadTable,
  row_id,
}) => {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (id, file) => {
    setLoading(true);
    uploadCertificate(id, file.name, file)
      .then((response) => {
        if (response.ok) {
          reloadTable();
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        console.error("couldnt upload file");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <FileField
      accept={file_parameters.extensions
        ? file_parameters.extensions.map((x) => `.${x}`).join(",")
        : undefined}
      label="Cargar"
      loading={loading}
      onChange={(files) => handleFileUpload(row_id, files[0])}
      only_icon={true}
    />
  );
};

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    formation_levels,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    end_date: "",
    formation_level: "",
    institution: "",
    start_date: "",
    status: false,
    title: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file_review_modal_open, setFileReviewModalOpen] = useState(false);
  const [review_modal_open, setReviewModalOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createContinuousTitle(
      fields.end_date || null,
      fields.formation_level,
      fields.institution,
      fields.start_date,
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
        title: "",
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  return (
    <Fragment>
      <ReviewForm
        approved={false}
        comments="&nbsp;"
        helper_text={error}
        loading={is_loading}
        onBeforeSubmit={() => {
          if (fields.end_date) {
            setFileReviewModalOpen(true);
          } else {
            setReviewModalOpen(true);
          }
        }}
        onClose={() => setModalOpen(false)}
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
      </ReviewForm>
      <FileReviewDialog
        onClose={() => setFileReviewModalOpen(false)}
        onConfirm={handleSubmit}
        open={file_review_modal_open}
      />
      <ReviewDialog
        approved={false}
        onClose={() => setReviewModalOpen(false)}
        onConfirm={handleSubmit}
        open={review_modal_open}
      />
    </Fragment>
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
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    approved: false,
    comments: "",
    end_date: "",
    formation_level: "",
    institution: "",
    start_date: "",
    status: false,
    title: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file_review_modal_open, setFileReviewModalOpen] = useState(false);
  const [review_modal_open, setReviewModalOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateContinuousTitle(
      data.id,
      fields.end_date || null,
      fields.institution,
      fields.start_date,
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
        institution: data.institution,
        start_date: data.start_date,
        status: !!data.end_date,
        title: data.title,
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  return (
    <Fragment>
      <ReviewForm
        approved={fields.approved}
        comments={fields.comments}
        helper_text={error}
        loading={is_loading}
        onBeforeSubmit={() => {
          if (fields.end_date) {
            setFileReviewModalOpen(true);
          } else {
            setReviewModalOpen(true);
          }
        }}
        onClose={() => setModalOpen(false)}
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
      </ReviewForm>
      <FileReviewDialog
        onClose={() => setFileReviewModalOpen(false)}
        onConfirm={handleSubmit}
        open={file_review_modal_open}
      />
      <ReviewDialog
        approved={false}
        onClose={() => setReviewModalOpen(false)}
        onConfirm={handleSubmit}
        open={review_modal_open}
      />
    </Fragment>
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
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    end_date: "",
    formation_level: "",
    institution: "",
    start_date: "",
    status: false,
    title: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setFields({
        end_date: data.end_date,
        formation_level: data.formation_level,
        institution: data.institution,
        start_date: data.start_date,
        status: !!data.end_date,
        title: data.title,
      });
      setLoading(false);
      setError(null);
    }
  }, [open]);

  const handleReview = (approved, observations) => {
    setLoading(true);
    setError(null);
    reviewContinuousTitle(
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
      <TextField
        fullWidth
        label="Institución"
        name="institution"
        value={fields.institution}
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

    const delete_progress = selected.map((id) => deleteContinuousTitle(id));

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

const getContinuousTitle = (id, review_mode = false) => {
  let request;
  if (review_mode) {
    request = getPersonContinuousTitle(id);
  } else {
    request = getUserContinuousTitle(id);
  }

  return request
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error();
    })
    .catch((e) => {
      console.log("Couldnt load the continuous title");
      throw e;
    });
};

export default function Continuada({
  review_mode = false,
}) {
  const [parameters, setParameters] = useState({
    formation_levels: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected_continuous_title, setSelectedContinuousTitle] = useState({});
  const [selected, setSelected] = useState([]);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);
  const [review_dialog_open, setReviewDialogOpen] = useState(false);
  const [review_modal_open, setReviewModalOpen] = useState(false);
  const [people, setPeople] = useState([]);
  const [selected_person, setSelectedPerson] = useState(null);

  const handleEditModalOpen = async (id) => {
    setSelectedContinuousTitle(await getContinuousTitle(id));
    setEditModalOpen(true);
  };

  const handleReviewModalOpen = async (id) => {
    setSelectedContinuousTitle(await getContinuousTitle(id, true));
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
          /** @type Array<{name: string}> */
          const formation_levels = await response.json();
          setParameters((prev_state) => ({
            ...prev_state,
            formation_levels: formation_levels.sort((
              { name: x },
              { name: y },
            ) => x.localeCompare(y)),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the formation levels"));
    if (review_mode) {
      getPeople()
        .then(async (response) => {
          /** @type Array<{pk_persona: number, nombre: string}>*/
          const people = await response.json();
          setPeople(
            people
              .map(({ pk_persona, nombre }) => [pk_persona, nombre])
              .sort(([_x, x], [_y, y]) => x.localeCompare(y)),
          );
        });
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
      <Title title={"Formación continuada"} />
      {review_mode
        ? (
          <Fragment>
            <AdvancedSelectField
              fullWidth
              label="Persona"
              onChange={(_event, value) => setSelectedPerson(value)}
              options={people}
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
          data={selected_continuous_title}
          is_open={is_edit_modal_open}
          setModalOpen={setEditModalOpen}
          updateTable={updateTable}
        />
        <ReviewModal
          data={selected_continuous_title}
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
        columns={review_mode ? review_headers : person_headers}
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
          ? "humanos/formacion/continuada/table"
          : "usuario/formacion/continuada/table"}
      />
      <ReviewDialog
        approved={false}
        onConfirm={() => console.log("this should allow us to load files now")}
        onClose={() => setReviewDialogOpen(false)}
        open={review_dialog_open}
      />
    </Fragment>
  );
}
