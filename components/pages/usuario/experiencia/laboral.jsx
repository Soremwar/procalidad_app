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
  fetchSectorApi,
  fetchPositionApi,
  fetchUserLaboralExperience,
} from "../../../../lib/api/generator.js";
import {
  formatDateToStringDatetime,
} from "../../../../lib/date/mod.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import CitySelector from "../../../common/CitySelector.jsx";
import DateField from "../../../common/DateField.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import FileField from "../../../common/FileField.jsx";
import Title from "../../../common/Title.jsx";
import SelectField from "../../../common/SelectField.jsx";

const getPositions = () => fetchPositionApi();
const getSectors = () => fetchSectorApi();

const getLaboralExperience = (id) => fetchUserLaboralExperience(id);

const createLaboralExperience = async (
  city,
  company,
  description,
  end_date,
  homologous_position,
  phone,
  position,
  sector,
  start_date,
) =>
  fetchUserLaboralExperience("", {
    body: JSON.stringify({
      city,
      company,
      description,
      end_date,
      homologous_position,
      phone,
      position,
      sector,
      start_date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateLaboralExperience = async (
  id,
  city,
  description,
  end_date,
  homologous_position,
  phone,
  position,
  sector,
  start_date,
) =>
  fetchUserLaboralExperience(id, {
    body: JSON.stringify({
      city,
      description,
      end_date,
      homologous_position,
      phone,
      position,
      sector,
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
    id: "position",
    numeric: false,
    disablePadding: false,
    label: "Cargo",
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
  positions: [],
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
  updateTable,
}) => {
  const {
    positions,
    sectors,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    city: "",
    company: "",
    description: "",
    end_date: "",
    homologous_position: "",
    phone: "",
    position: "",
    sector: "",
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
      fields.city,
      fields.company,
      fields.description,
      fields.end_date,
      fields.homologous_position,
      fields.phone,
      fields.position,
      fields.sector,
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
        city: "",
        company: "",
        description: "",
        end_date: "",
        homologous_position: "",
        phone: "",
        position: "",
        sector: "",
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
      <TextField
        fullWidth
        inputProps={{
          maxLength: "50",
        }}
        label="Empresa"
        name="company"
        onChange={(e) => {
          const company = e.target.value.toUpperCase();
          setFields((prev_state) => ({ ...prev_state, company }));
        }}
        required
        value={fields.company}
      />
      <SelectField
        fullWidth
        label="Sector"
        name="sector"
        onChange={handleChange}
        required
        value={fields.sector}
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
      <SelectField
        fullWidth
        label="Cargo equivalente"
        name="homologous_position"
        onChange={handleChange}
        required
        value={fields.homologous_position}
      >
        {positions
          .map(({ pk_cargo, nombre }) => (
            <option key={pk_cargo} value={pk_cargo}>{nombre}</option>
          ))}
      </SelectField>
      <CitySelector
        label="Lugar de Trabajo"
        setValue={(city) => {
          setFields((prev_state) => ({ ...prev_state, city }));
        }}
        value={fields.city}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "20",
        }}
        label="Teléfono"
        name="phone"
        onChange={(e) => {
          const phone = e.target.value.toUpperCase();
          setFields((prev_state) => ({ ...prev_state, phone }));
        }}
        required
        value={fields.phone}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "1000",
        }}
        label="Logros y Responsabilidades"
        multiline
        rows={3}
        rowsMax={10}
        name="description"
        onChange={handleChange}
        required
        value={fields.description}
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
    positions,
    sectors,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    city: "",
    company: "",
    description: "",
    end_date: "",
    homologous_position: "",
    phone: "",
    position: "",
    sector: "",
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
      fields.city,
      fields.description,
      fields.end_date,
      fields.homologous_position,
      fields.phone,
      fields.position,
      fields.sector,
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
        city: data.city,
        company: data.company,
        description: data.description,
        end_date: data.end_date,
        homologous_position: data.homologous_position,
        phone: data.phone,
        position: data.position,
        sector: data.sector,
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
        label="Empresa"
        name="company"
        value={fields.company}
      />
      <SelectField
        fullWidth
        label="Sector"
        name="sector"
        onChange={handleChange}
        required
        value={fields.sector}
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
      <SelectField
        fullWidth
        label="Cargo equivalente"
        name="homologous_position"
        onChange={handleChange}
        required
        value={fields.homologous_position}
      >
        {positions
          .map(({ pk_cargo, nombre }) => (
            <option key={pk_cargo} value={pk_cargo}>{nombre}</option>
          ))}
      </SelectField>
      <CitySelector
        label="Lugar de Trabajo"
        setValue={(city) => {
          setFields((prev_state) => ({ ...prev_state, city }));
        }}
        value={fields.city}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "20",
        }}
        label="Teléfono"
        name="phone"
        onChange={(e) => {
          const phone = e.target.value.toUpperCase();
          setFields((prev_state) => ({ ...prev_state, phone }));
        }}
        required
        value={fields.phone}
      />
      <TextField
        fullWidth
        inputProps={{
          maxLength: "1000",
        }}
        label="Logros y Responsabilidades"
        multiline
        rows={3}
        rowsMax={10}
        name="description"
        onChange={handleChange}
        required
        value={fields.description}
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
    positions: [],
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

  useEffect(() => {
    getPositions()
      .then(async (response) => {
        if (response.ok) {
          const positions = await response.json()
            .then((positions) =>
              positions.sort(({ nombre: x }, { nombre: y }) =>
                x.localeCompare(y)
              )
            );
          setParameters((prev_state) => ({ ...prev_state, positions }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the positions"));
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
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Experiencia laboral"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
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
