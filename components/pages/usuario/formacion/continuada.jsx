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
  IconButton,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { GetApp as DownloadIcon } from "@material-ui/icons";
import { formatResponseJson } from "../../../../lib/api/request.js";
import {
  fetchFormationLevelApi,
  fetchUserContinuousFormation,
} from "../../../../lib/api/generator.js";
import { formatDateToStringDatetime } from "../../../../lib/date/mod.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import DateField from "../../../common/DateField.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import FileField from "../../../common/FileField.jsx";
import Title from "../../../common/Title.jsx";
import SelectField from "../../../common/SelectField.jsx";
import ReviewBadge from "../common/ReviewBadge";
import FileReviewDialog from "../common/FileReviewDialog.jsx";
import ReviewForm from "../common/ReviewForm.jsx";

const getFormationLevels = () =>
  fetchFormationLevelApi({
    params: {
      formation_type: "Continuada",
    },
  });

const getContinuousTitle = (id) => fetchUserContinuousFormation(id);

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
          <Tooltip title="Descargar">
            <IconButton
              color="primary"
              component={"a"}
              disabled={!value.id}
              href={`/api/archivos/generico/${value.id}`}
              target={"_blank"}
              variant="contained"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
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
  const [fileReviewCallback, setFileReviewCallback] = useState(() => {});
  const [file_review_modal_open, setFileReviewModalOpen] = useState(false);

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
        onBeforeSubmit={(callback) => {
          if (fields.end_date) {
            setFileReviewCallback(() => callback);
            setFileReviewModalOpen(true);
          } else {
            callback();
          }
        }}
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
        onConfirm={fileReviewCallback}
        open={file_review_modal_open}
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
  const [fileReviewCallback, setFileReviewCallback] = useState(() => {});
  const [file_review_modal_open, setFileReviewModalOpen] = useState(false);

  const pending = !fields.approved && !fields.comments;

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
        onBeforeSubmit={(callback) => {
          if (fields.end_date) {
            setFileReviewCallback(() => callback);
            setFileReviewModalOpen(true);
          } else {
            callback();
          }
        }}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        open={is_open}
        title={"Editar"}
      >
        <fieldset disabled={pending}>
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
        </fieldset>
      </ReviewForm>
      <FileReviewDialog
        onClose={() => setFileReviewModalOpen(false)}
        onConfirm={fileReviewCallback}
        open={file_review_modal_open}
      />
    </Fragment>
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

export default function Continuada() {
  const [parameters, setParameters] = useState({
    formation_levels: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected_continuous_title, setSelectedContinuousTitle] = useState({});
  const [selected, setSelected] = useState([]);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getContinuousTitle(id)
      .then(async (response) => {
        if (response.ok) {
          setSelectedContinuousTitle(await response.json());
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch((e) => console.error("Couldnt load the continuous title"));
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
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Formación continuada"} />
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
        url={"usuario/formacion/continuada/table"}
      />
    </Fragment>
  );
}
