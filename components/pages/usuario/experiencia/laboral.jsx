import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Button,
  DialogContentText,
  Grid,
  TextField,
} from "@material-ui/core";
import {
  GetApp as DownloadIcon,
} from "@material-ui/icons";
import {
  formatResponseJson,
} from "../../../../lib/api/request.js";
import {
  fetchClientApi,
  fetchSectorApi,
  fetchUserLaboralExperience,
} from "../../../../lib/api/generator.js";
import {
  formatDateToStringDatetime,
} from "../../../../lib/date/mod.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import Autocomplete from "../../../common/Autocomplete.jsx";
import CitySelector from "../../../common/CitySelector.jsx";
import DateField from "../../../common/DateField.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import FileField from "../../../common/FileField.jsx";
import Title from "../../../common/Title.jsx";
import SelectField from "../../../common/SelectField.jsx";

const getClients = () => fetchClientApi();
const getLaboralExperiences = () => fetchUserLaboralExperience();
const getSectors = () => fetchSectorApi();

const getLaboralExperience = (id) => fetchUserLaboralExperience(id);

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

const headers = [
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
    displayAs: (id, value, reloadTable) => (
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <FileUploader
            file_parameters={value}
            row_id={id}
            reloadTable={reloadTable}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <Button
            color="primary"
            component={"a"}
            disabled={!value.id}
            endIcon={<DownloadIcon />}
            href={`/api/archivos/generico/${value.id}`}
            target={"_blank"}
            variant="contained"
          >
            Descargar
          </Button>
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
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Crear Nuevo"}
    >
      <Autocomplete
        fetchOptions={async () => {
          return clients
            .map((x) => x.razon_social.toUpperCase())
            .concat(companies)
            .sort((a, b) => a.localeCompare(b));
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
        required
        value={fields.achievement_description}
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
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Editar"}
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
        required
        value={fields.achievement_description}
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

export default () => {
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

  const handleEditModalOpen = async (id) => {
    await getLaboralExperience(id)
      .then(async (response) => {
        if (response.ok) {
          setSelectedLaboralExperience(await response.json());
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch((e) => console.error("Couldnt load the laboral experience"));
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
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Experiencia laboral"} />
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
        url={"usuario/experiencia/laboral/table"}
      />
    </Fragment>
  );
};
