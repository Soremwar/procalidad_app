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
  fetchClientApi,
  fetchHRLaboralExperience,
  fetchPeopleApi,
  fetchSectorApi,
  fetchUserLaboralExperience,
} from "../../../../lib/api/generator.js";
import { formatDateToStringDatetime } from "../../../../lib/date/mod.js";
import AdvancedSelectField from "../../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import Autocomplete from "../../../common/Autocomplete.jsx";
import CitySelector from "../../../common/CitySelector.jsx";
import DateField from "../../../common/DateField.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import DownloadButton from "../../../common/DownloadButton.jsx";
import FileField from "../../../common/FileField.jsx";
import FileReviewDialog from "../common/FileReviewDialog.jsx";
import Title from "../../../common/Title.jsx";
import ReviewBadge from "../common/ReviewBadge.jsx";
import ReviewForm from "../common/ReviewForm.jsx";
import ReviewerForm from "../common/ReviewerForm.jsx";
import SelectField from "../../../common/SelectField.jsx";

const getClients = () => fetchClientApi();
const getLaboralExperiences = () => fetchUserLaboralExperience();
const getPeople = () => fetchPeopleApi();
const getSectors = () => fetchSectorApi();

const getUserLaboralExperience = (id) => fetchUserLaboralExperience(id);
const getPersonLaboralExperience = (id) => fetchHRLaboralExperience(id);

const createLaboralExperience = async (
  achievement_description,
  company_address,
  company_city,
  company_name,
  company_nit,
  company_phone,
  company_sector,
  company_verification_digit,
  contact,
  end_date,
  function_description,
  position,
  start_date,
) =>
  fetchUserLaboralExperience("", {
    body: JSON.stringify({
      achievement_description,
      company_address,
      company_city,
      company_name,
      company_nit,
      company_phone,
      company_sector,
      company_verification_digit,
      contact,
      end_date,
      function_description,
      position,
      start_date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateLaboralExperience = async (
  id,
  achievement_description,
  company_address,
  company_city,
  company_name,
  company_nit,
  company_phone,
  company_sector,
  company_verification_digit,
  contact,
  end_date,
  function_description,
  position,
  start_date,
) =>
  fetchUserLaboralExperience(id, {
    body: JSON.stringify({
      achievement_description,
      company_address,
      company_city,
      company_name,
      company_nit,
      company_phone,
      company_sector,
      company_verification_digit,
      contact,
      end_date,
      function_description,
      position,
      start_date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteLaboralExperience = async (id) =>
  fetchUserLaboralExperience(id, {
    method: "DELETE",
  });

const reviewLaboralExperience = async (
  id,
  approved,
  observations,
) =>
  fetchHRLaboralExperience(id, {
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
  return fetchUserLaboralExperience(`certificado/${id}`, {
    body: data,
    method: "PUT",
  });
};

const common_headers = [
  {
    id: "sector",
    numeric: false,
    disablePadding: false,
    label: "Sector",
    searchable: true,
  },
  {
    id: "company",
    numeric: false,
    disablePadding: false,
    label: "Empresa",
    searchable: true,
  },
  {
    displayAs: (_id, value) => {
      const years = Number(value) || 0;
      if (years < 1) {
        return "<1 año";
      } else if (years === 1) {
        return "1 año";
      } else {
        return `${years} años`;
      }
    },
    id: "duration",
    numeric: false,
    disablePadding: false,
    label: "Duracion(años)",
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
  clients: [],
  companies: [],
  sectors: [],
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
  updateCompanies,
  updateTable,
}) => {
  const {
    clients,
    companies,
    sectors,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    achievement_description: "",
    company_address: "",
    company_city: "",
    company_name: "",
    company_nit: "",
    company_phone: "",
    company_sector: "",
    company_verification_digit: "",
    contact: "",
    end_date: "",
    function_description: "",
    position: "",
    start_date: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file_review_modal_open, setFileReviewModalOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createLaboralExperience(
      fields.achievement_description,
      fields.company_address,
      fields.company_city,
      fields.company_name,
      fields.company_nit,
      fields.company_phone,
      fields.company_sector,
      fields.company_verification_digit,
      fields.contact,
      fields.end_date,
      fields.function_description,
      fields.position,
      fields.start_date,
    );

    if (request.ok) {
      setModalOpen(false);
      updateCompanies();
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
        achievement_description: "",
        company_address: "",
        company_city: "",
        company_name: "",
        company_nit: "",
        company_phone: "",
        company_sector: "",
        company_verification_digit: "",
        contact: "",
        end_date: "",
        function_description: "",
        position: "",
        start_date: "",
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
          setFileReviewModalOpen(true);
        }}
        onClose={() => setModalOpen(false)}
        open={is_open}
        title="Crear nuevo"
      >
        <Autocomplete
          fetchOptions={async () => {
            return [
              ...new Set(
                clients
                  .map((x) => x.razon_social.toUpperCase())
                  .concat(companies)
                  .sort((a, b) => a.localeCompare(b)),
              ),
            ];
          }}
          label="Razón social de la empresa"
          max={50}
          name="company_name"
          setValue={(value) =>
            setFields((prev_state) => ({
              ...prev_state,
              company_name: value.toUpperCase(),
            }))}
          value={fields.company_name}
        />
        <Grid container spacing={1}>
          <Grid item md={7} xs={12}>
            <TextField
              fullWidth
              inputProps={{
                min: "1",
                max: "999999999",
              }}
              label="NIT"
              name="company_nit"
              onChange={handleChange}
              required
              type="number"
              value={fields.company_nit}
            />
          </Grid>
          <Grid item md={5} xs={12}>
            <TextField
              fullWidth
              inputProps={{
                min: "0",
                max: "9",
              }}
              label="Dígito de verificación"
              name="company_verification_digit"
              onChange={handleChange}
              required
              type="number"
              value={fields.company_verification_digit}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          inputProps={{
            maxLength: "100",
          }}
          label="Dirección"
          name="company_address"
          onChange={handleChange}
          required
          value={fields.company_address}
        />
        <SelectField
          fullWidth
          label="Sector"
          name="company_sector"
          onChange={handleChange}
          required
          value={fields.company_sector}
        >
          {sectors
            .map(({ pk_sector, nombre }) => (
              <option key={pk_sector} value={pk_sector}>{nombre}</option>
            ))}
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
          fullWidth
          label="Fecha de finalización"
          name="end_date"
          onChange={handleChange}
          required
          value={fields.end_date}
        />
        <TextField
          fullWidth
          inputProps={{
            maxLength: "50",
          }}
          label="Cargo"
          name="position"
          onChange={handleChange}
          required
          value={fields.position}
        />
        <CitySelector
          label="Lugar de Trabajo"
          setValue={(company_city) => {
            setFields((prev_state) => ({ ...prev_state, company_city }));
          }}
          value={fields.company_city}
        />
        <TextField
          fullWidth
          inputProps={{
            maxLength: "255",
          }}
          label="Contacto"
          name="contact"
          onChange={handleChange}
          required
          value={fields.contact}
        />
        <TextField
          fullWidth
          label="Teléfono"
          name="company_phone"
          onChange={handleChange}
          required
          type="number"
          value={fields.company_phone}
        />
        <TextField
          fullWidth
          inputProps={{
            maxLength: "1000",
          }}
          label="Funciones"
          multiline
          rows={3}
          rowsMax={10}
          name="function_description"
          onChange={handleChange}
          placeholder="Ej:&#10;Desarrollar los componentes técnicos requeridos (BackEnd y FrontEnd) en la ejecución de los proyectos de BI donde fue asignado"
          required
          value={fields.function_description}
        />
        <TextField
          fullWidth
          inputProps={{
            maxLength: "1000",
          }}
          label="Logros a resaltar"
          multiline
          rows={3}
          rowsMax={10}
          name="achievement_description"
          onChange={handleChange}
          placeholder="Ej:&#10;Conseguimos el distintivo oficial como proveedor preferente&#10;Mi equipo comercial hizo aumentar la facturación de la empresa en un 40%"
          required
          value={fields.achievement_description}
        />
      </ReviewForm>
      <FileReviewDialog
        onClose={() => setFileReviewModalOpen(false)}
        onConfirm={handleSubmit}
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
    sectors,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    achievement_description: "",
    approved: false,
    comments: "",
    company_address: "",
    company_city: "",
    company_name: "",
    company_nit: "",
    company_phone: "",
    company_sector: "",
    company_verification_digit: "",
    contact: "",
    end_date: "",
    function_description: "",
    position: "",
    start_date: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file_review_modal_open, setFileReviewModalOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateLaboralExperience(
      data.id,
      fields.achievement_description,
      fields.company_address,
      fields.company_city,
      fields.company_name,
      fields.company_nit,
      fields.company_phone,
      fields.company_sector,
      fields.company_verification_digit,
      fields.contact,
      fields.end_date,
      fields.function_description,
      fields.position,
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
        achievement_description: data.achievement_description,
        approved: data.approved,
        comments: data.observations,
        company_address: data.company_address,
        company_city: data.company_city,
        company_name: data.company_name,
        company_nit: data.company_nit,
        company_phone: data.company_phone,
        company_sector: data.company_sector,
        company_verification_digit: data.company_verification_digit,
        contact: data.contact,
        end_date: data.end_date,
        function_description: data.function_description,
        position: data.position,
        start_date: data.start_date,
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
        onBeforeSubmit={() => setFileReviewModalOpen(true)}
        onClose={() => setModalOpen(false)}
        open={is_open}
        title="Editar"
      >
        <TextField
          disabled
          fullWidth
          label="Razón social de la empresa"
          name="company_name"
          value={fields.company_name}
        />
        <Grid container spacing={1}>
          <Grid item md={7} xs={12}>
            <TextField
              fullWidth
              inputProps={{
                min: "1",
                max: "999999999",
              }}
              label="NIT"
              name="company_nit"
              onChange={handleChange}
              required
              type="number"
              value={fields.company_nit}
            />
          </Grid>
          <Grid item md={5} xs={12}>
            <TextField
              fullWidth
              inputProps={{
                min: "0",
                max: "9",
              }}
              label="Dígito de verificación"
              name="company_verification_digit"
              onChange={handleChange}
              required
              type="number"
              value={fields.company_verification_digit}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          inputProps={{
            maxLength: "100",
          }}
          label="Dirección"
          name="company_address"
          onChange={handleChange}
          required
          value={fields.company_address}
        />
        <SelectField
          fullWidth
          label="Sector"
          name="company_sector"
          onChange={handleChange}
          required
          value={fields.company_sector}
        >
          {sectors
            .map(({ pk_sector, nombre }) => (
              <option key={pk_sector} value={pk_sector}>{nombre}</option>
            ))}
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
          fullWidth
          label="Fecha de finalización"
          name="end_date"
          onChange={handleChange}
          required
          value={fields.end_date}
        />
        <TextField
          fullWidth
          inputProps={{
            maxLength: "50",
          }}
          label="Cargo"
          name="position"
          onChange={handleChange}
          required
          value={fields.position}
        />
        <CitySelector
          label="Lugar de Trabajo"
          setValue={(company_city) => {
            setFields((prev_state) => ({ ...prev_state, company_city }));
          }}
          value={fields.company_city}
        />
        <TextField
          fullWidth
          inputProps={{
            maxLength: "255",
          }}
          label="Contacto"
          name="contact"
          onChange={handleChange}
          required
          value={fields.contact}
        />
        <TextField
          fullWidth
          label="Teléfono"
          name="company_phone"
          onChange={handleChange}
          required
          type="number"
          value={fields.company_phone}
        />
        <TextField
          fullWidth
          inputProps={{
            maxLength: "1000",
          }}
          label="Funciones"
          multiline
          rows={3}
          rowsMax={10}
          name="function_description"
          onChange={handleChange}
          placeholder="Ej:&#10;Desarrollar los componentes técnicos requeridos (BackEnd y FrontEnd) en la ejecución de los proyectos de BI donde fue asignado"
          required
          value={fields.function_description}
        />
        <TextField
          fullWidth
          inputProps={{
            maxLength: "1000",
          }}
          label="Logros a resaltar"
          multiline
          rows={3}
          rowsMax={10}
          name="achievement_description"
          onChange={handleChange}
          placeholder="Ej:&#10;Conseguimos el distintivo oficial como proveedor preferente&#10;Mi equipo comercial hizo aumentar la facturación de la empresa en un 40%"
          required
          value={fields.achievement_description}
        />
      </ReviewForm>
      <FileReviewDialog
        onClose={() => setFileReviewModalOpen(false)}
        onConfirm={handleSubmit}
        open={file_review_modal_open}
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
    sectors,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    achievement_description: "",
    company_address: "",
    company_city: "",
    company_name: "",
    company_nit: "",
    company_phone: "",
    company_sector: "",
    company_verification_digit: "",
    contact: "",
    end_date: "",
    function_description: "",
    position: "",
    start_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setFields({
        achievement_description: data.achievement_description,
        company_address: data.company_address,
        company_city: data.company_city,
        company_name: data.company_name,
        company_nit: data.company_nit,
        company_phone: data.company_phone,
        company_sector: data.company_sector,
        company_verification_digit: data.company_verification_digit,
        contact: data.contact,
        end_date: data.end_date,
        function_description: data.function_description,
        position: data.position,
        start_date: data.start_date,
      });
      setLoading(false);
      setError(null);
    }
  }, [open]);

  const handleReview = (approved, observations) => {
    setLoading(true);
    setError(null);
    reviewLaboralExperience(
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
        label="Razón social de la empresa"
        name="company_name"
        value={fields.company_name}
      />
      <Grid container spacing={1}>
        <Grid item md={7} xs={12}>
          <TextField
            fullWidth
            label="NIT"
            name="company_nit"
            type="number"
            value={fields.company_nit}
          />
        </Grid>
        <Grid item md={5} xs={12}>
          <TextField
            fullWidth
            label="Dígito de verificación"
            name="company_verification_digit"
            type="number"
            value={fields.company_verification_digit}
          />
        </Grid>
      </Grid>
      <TextField
        fullWidth
        label="Dirección"
        name="company_address"
        value={fields.company_address}
      />
      <SelectField
        fullWidth
        label="Sector"
        name="company_sector"
        value={fields.company_sector}
      >
        {sectors
          .map(({ pk_sector, nombre }) => (
            <option key={pk_sector} value={pk_sector}>{nombre}</option>
          ))}
      </SelectField>
      <DateField
        fullWidth
        label="Fecha de inicio"
        name="start_date"
        value={fields.start_date}
      />
      <DateField
        fullWidth
        label="Fecha de finalización"
        name="end_date"
        value={fields.end_date}
      />
      <TextField
        fullWidth
        label="Cargo"
        name="position"
        value={fields.position}
      />
      <CitySelector
        label="Lugar de Trabajo"
        setValue={() => {}}
        value={fields.company_city}
      />
      <TextField
        fullWidth
        label="Contacto"
        name="contact"
        value={fields.contact}
      />
      <TextField
        fullWidth
        label="Teléfono"
        name="company_phone"
        type="number"
        value={fields.company_phone}
      />
      <TextField
        fullWidth
        label="Funciones"
        multiline
        rows={3}
        rowsMax={10}
        name="function_description"
        value={fields.function_description}
      />
      <TextField
        fullWidth
        label="Logros a resaltar"
        multiline
        rows={3}
        rowsMax={10}
        name="achievement_description"
        value={fields.achievement_description}
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

    const delete_progress = selected.map((id) => deleteLaboralExperience(id));

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

const getLaboralExperience = (id, review_mode = false) => {
  let request;
  if (review_mode) {
    request = getPersonLaboralExperience(id);
  } else {
    request = getUserLaboralExperience(id);
  }

  return request
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error();
    })
    .catch((e) => {
      console.log("Couldnt load the laboral experience", e);
      throw e;
    });
};

export default function Laboral({
  review_mode = false,
}) {
  const [parameters, setParameters] = useState({
    clients: [],
    companies: [],
    sectors: [],
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
    setSelectedLaboralExperience(await getLaboralExperience(id));
    setEditModalOpen(true);
  };

  const handleReviewModalOpen = async (id) => {
    setSelectedLaboralExperience(await getLaboralExperience(id, true));
    setReviewModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  const updateCompanies = () => {
    getLaboralExperiences()
      .then(async (response) => {
        if (response.ok) {
          const companies = await response.json()
            .then((experience) => experience.map((x) => x.company_name));
          setParameters((prev_state) => ({ ...prev_state, companies }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the companies"));
  };

  useEffect(() => {
    getClients()
      .then(async (response) => {
        if (response.ok) {
          const clients = await response.json();
          setParameters((prev_state) => ({ ...prev_state, clients }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the clients"));
    getSectors()
      .then(async (response) => {
        if (response.ok) {
          const sectors = await response.json()
            .then((sectors) =>
              sectors.sort(({ nombre: x }, { nombre: y }) => x.localeCompare(y))
            );
          setParameters((prev_state) => ({ ...prev_state, sectors }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the sectors"));
    updateCompanies();
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
      <Title title="Experiencia laboral" />
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
          updateCompanies={updateCompanies}
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
          ? "humanos/experiencia/laboral/table"
          : "usuario/experiencia/laboral/table"}
      />
    </Fragment>
  );
}
