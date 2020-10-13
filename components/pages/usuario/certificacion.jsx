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
import { formatResponseJson } from "../../../lib/api/request.js";
import {
  fetchCertificationProviderApi,
  fetchCertificationTemplateApi,
  fetchCertificationTypeApi,
  fetchUserCertification,
} from "../../../lib/api/generator.js";
import { formatDateToStringDatetime } from "../../../lib/date/mod.js";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DateField from "../../common/DateField.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import FileField from "../../common/FileField.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";

const getProviders = () => fetchCertificationProviderApi();
const getTemplates = () => fetchCertificationTemplateApi();
const getTypes = () => fetchCertificationTypeApi();

const getCertification = (id) => fetchUserCertification(id);

const createCertification = async (
  expedition_date,
  expiration_date,
  name,
  provider,
  template,
  type,
  version,
) =>
  fetchUserCertification("", {
    body: JSON.stringify({
      expedition_date,
      expiration_date,
      name,
      provider,
      template,
      type,
      version,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateCertification = async (
  id,
  expedition_date,
  expiration_date,
  name,
  provider,
  template,
  type,
) =>
  fetchUserCertification(id, {
    body: JSON.stringify({
      expedition_date,
      expiration_date,
      name,
      provider,
      template,
      type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteCertification = async (id) =>
  fetchUserCertification(id, {
    method: "DELETE",
  });

const uploadCertificate = async (
  id,
  name,
  file,
) => {
  const data = new FormData();
  data.append(name, file);
  return fetchUserCertification(`certificado/${id}`, {
    body: data,
    method: "PUT",
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
    id: "template",
    numeric: false,
    disablePadding: false,
    label: "Certificación",
    searchable: true,
  },
  {
    id: "type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de certificación",
    searchable: true,
  },
  {
    id: "version",
    numeric: false,
    disablePadding: false,
    label: "Version",
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
    label: "Cargar certificado",
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

const INITIAL_PARAMETER_STATE = {
  providers: [],
  templates: [],
  types: [],
};
const ParameterContext = createContext(INITIAL_PARAMETER_STATE);

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
    providers,
    templates,
    types,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    certification_expires: false,
    expedition_date: "",
    expiration_date: "",
    name: "",
    provider: "",
    template: "",
    type: "",
    version: "",
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

    const request = await createCertification(
      fields.expedition_date,
      fields.certification_expires ? fields.expiration_date : null,
      fields.name,
      fields.provider,
      fields.template,
      fields.type,
      fields.version.trim() || null,
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
        certification_expires: false,
        expedition_date: "",
        expiration_date: "",
        name: "",
        provider: "",
        template: "",
        type: "",
        version: "",
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
        label="Proveedor"
        name="provider"
        onChange={handleChange}
        required
        value={fields.provider}
      >
        {providers
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <SelectField
        disabled={!fields.provider}
        fullWidth
        label="Certificación"
        name="template"
        onChange={handleChange}
        required
        value={fields.template}
      >
        {templates
          .filter(({ provider }) => provider == fields.provider)
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Tipo de certificación"
        name="type"
        onChange={handleChange}
        required
        value={fields.type}
      >
        {types
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <TextField
        fullWidth
        inputProps={{
          maxLength: "50",
        }}
        label="Nombre"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "10",
        }}
        label="Versión"
        name="version"
        onChange={handleChange}
        value={fields.version}
      />
      <DateField
        fullWidth
        label="Fecha de expedición"
        name="expedition_date"
        onChange={handleChange}
        required
        value={fields.expedition_date}
      />
      <SelectField
        blank_value={false}
        fullWidth
        label="Expiración certificación"
        name="certification_expires"
        onChange={(event) => {
          const certification_expires = Boolean(Number(event.target.value));
          setFields((prevState) => ({
            ...prevState,
            certification_expires,
          }));
        }}
        value={Number(fields.certification_expires)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      {fields.certification_expires
        ? (
          <DateField
            fullWidth
            label="Fecha de expiración"
            name="expiration_date"
            onChange={handleChange}
            required
            value={fields.expiration_date}
          />
        )
        : null}
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
    providers,
    templates,
    types,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    certification_expires: false,
    expedition_date: "",
    expiration_date: "",
    name: "",
    provider: "",
    template: "",
    type: "",
    version: "",
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

    const request = await updateCertification(
      data.id,
      fields.expedition_date,
      fields.certification_expires ? fields.expiration_date : null,
      fields.name,
      fields.provider,
      fields.template,
      fields.type,
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
    const template = templates.find(({ id }) => id == data.template);
    if (is_open) {
      setFields({
        certification_expires: !!data.expiration_date,
        expedition_date: data.expedition_date,
        expiration_date: data.expiration_date || "",
        name: data.name,
        provider: template?.provider || "",
        template: data.template,
        type: data.type,
        version: data.version || "",
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
        label="Proveedor"
        name="provider"
        onChange={handleChange}
        required
        value={fields.provider}
      >
        {providers
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <SelectField
        disabled={!fields.provider}
        fullWidth
        label="Certificación"
        name="template"
        onChange={handleChange}
        required
        value={fields.template}
      >
        {templates
          .filter(({ provider }) => provider == fields.provider)
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Tipo de certificación"
        name="type"
        onChange={handleChange}
        required
        value={fields.type}
      >
        {types
          .map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </SelectField>
      <TextField
        fullWidth
        inputProps={{
          maxLength: "50",
        }}
        label="Nombre"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        disabled
        fullWidth
        inputProps={{
          maxLength: "10",
        }}
        label="Versión"
        name="version"
        onChange={handleChange}
        value={fields.version}
      />
      <DateField
        fullWidth
        label="Fecha de expedición"
        name="expedition_date"
        onChange={handleChange}
        required
        value={fields.expedition_date}
      />
      <SelectField
        blank_value={false}
        fullWidth
        label="Expiración certificación"
        name="certification_expires"
        onChange={(event) => {
          const certification_expires = Boolean(Number(event.target.value));
          setFields((prevState) => ({
            ...prevState,
            certification_expires,
          }));
        }}
        value={Number(fields.certification_expires)}
      >
        <option value="0">No</option>
        <option value="1">Sí</option>
      </SelectField>
      {fields.certification_expires
        ? (
          <DateField
            fullWidth
            label="Fecha de expiración"
            name="expiration_date"
            onChange={handleChange}
            required
            value={fields.expiration_date}
          />
        )
        : null}
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

    const delete_progress = selected.map((id) => deleteCertification(id));

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

export default function Certificacion() {
  const [parameters, setParameters] = useState(INITIAL_PARAMETER_STATE);
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected_academic_title, setSelectedAcademicTitle] = useState({});
  const [selected, setSelected] = useState([]);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getCertification(id)
      .then(async (response) => {
        if (response.ok) {
          setSelectedAcademicTitle(await response.json());
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch((e) => console.error("Couldnt load the academic title"));
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    getProviders()
      .then(async (response) => {
        if (response.ok) {
          /** @type Array<{id: number, name: string}> */
          const providers = await response.json();
          setParameters((prev_state) => ({
            ...prev_state,
            providers: providers
              .sort(({ name: x }, { name: y }) => x.localeCompare(y)),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the providers"));

    getTemplates()
      .then(async (response) => {
        if (response.ok) {
          /** @type Array<{id: number, name: string}> */
          const templates = await response.json();
          setParameters((prev_state) => ({
            ...prev_state,
            templates: templates
              .sort(({ name: x }, { name: y }) => x.localeCompare(y)),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the templates"));

    getTypes()
      .then(async (response) => {
        if (response.ok) {
          /** @type Array<{id: number, name: string}> */
          const types = await response.json();
          setParameters((prev_state) => ({
            ...prev_state,
            types: types
              .sort(({ name: x }, { name: y }) => x.localeCompare(y)),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the types"));
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title="Certificaciones" />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_academic_title}
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
        url={"usuario/certificacion/table"}
      />
    </Fragment>
  );
}
