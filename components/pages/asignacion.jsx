import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AppBar,
  Box,
  DialogContentText,
  Grid,
  Snackbar,
  Tab,
  Tabs,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import { UserContext } from "../context/User.jsx";
import { formatResponseJson } from "../../lib/api/request.ts";
import {
  formatDateAsWeekLocal,
  formatStandardNumberToStandardString,
  formatStandardStringToStandardNumber,
  parseDateToStandardNumber,
} from "../../lib/date/mod.js";
import {
  fetchAssignationApi,
  fetchAssignationRequestApi,
  fetchBudgetApi,
  fetchBudgetDetailApi,
  fetchClientApi,
  fetchEarlyCloseRequestApi,
  fetchPeopleApi,
  fetchProjectApi,
  fetchRoleApi,
} from "../../lib/api/generator.js";
import AdvancedSelectField from "../common/AdvancedSelectField.jsx";
import AssignationRequestTable from "./asignacion/AssignationRequestTable.jsx";
import AsyncSelectField from "../common/AsyncSelectField.jsx";
import AsyncTable from "../common/AsyncTable/Table.jsx";
import DateField from "../common/DateField.jsx";
import DialogForm from "../common/DialogForm.jsx";
import EarlyCloseRequestTable from "./asignacion/EarlyCloseRequestTable.jsx";
import SelectField from "../common/SelectField.jsx";
import Title from "../common/Title.jsx";

const getBudgets = () => fetchBudgetApi().then((x) => x.json());
const getBudgetDetails = (id) => fetchBudgetDetailApi(id).then((x) => x.json());
const getClients = () =>
  fetchClientApi({
    params: {
      assignated_only: true,
    },
  }).then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getProjects = () =>
  fetchProjectApi({
    params: {
      assignated_only: true,
    },
  }).then((x) => x.json());
const getRoles = () => fetchRoleApi().then((x) => x.json());
const getWeeks = () => fetchAssignationApi("semanas").then((x) => x.json());

const getAssignation = (id) => fetchAssignationApi(id).then((x) => x.json());

const createAssignation = async (
  date,
  hours,
  person,
  project,
  role,
) =>
  fetchAssignationApi("", {
    body: JSON.stringify({
      date,
      hours,
      person,
      project,
      role,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateAssignation = async (
  id,
  request,
) =>
  fetchAssignationApi(id, {
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteAssignation = async (id) =>
  fetchAssignationApi(id, {
    method: "DELETE",
  });

const getAssignationRequestTable = async (id) =>
  fetchAssignationRequestApi(`table/${id}`);

const getEarlyCloseRequestTable = () => fetchEarlyCloseRequestApi();

const updateAssignationRequest = async (id, approved, reason) =>
  fetchAssignationRequestApi(id, {
    body: JSON.stringify({ approved, reason }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const updateEarlyCloseRequest = async (id, approved, reason) =>
  fetchEarlyCloseRequestApi(id, {
    body: JSON.stringify({ approved, reason }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const headers = [
  {
    id: "person",
    numeric: false,
    disablePadding: false,
    label: "Recurso",
    searchable: true,
  },
  {
    id: "role",
    numeric: false,
    disablePadding: false,
    label: "Rol",
    searchable: true,
  },
  {
    id: "date",
    numeric: false,
    disablePadding: false,
    label: "Fecha",
    searchable: true,
  },
  {
    id: "hours",
    numeric: false,
    disablePadding: false,
    label: "Horas",
    searchable: true,
  },
  {
    id: "editable",
    numeric: false,
    disablePadding: false,
    label: "Modificable",
    searchable: true,
  },
];

const DEFAULT_PARAMETERS = {
  budgets: [],
  clients: [],
  people: [],
  projects: [],
  roles: [],
  weeks: [],
};

const ParameterContext = createContext(DEFAULT_PARAMETERS);

const TabPanel = ({ children, index, value }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
  >
    {value === index && (
      <Box p={3}>
        {children}
      </Box>
    )}
  </div>
);

const DEFAULT_FIELDS = {
  budget: "",
  client: "",
  date: "",
  hours: "",
  person: "",
  project: "",
  role: null,
};

const AddModal = ({
  callback,
  is_open,
  project,
  setModalOpen,
}) => {
  const {
    budgets,
    clients,
    people,
    projects,
  } = useContext(ParameterContext);

  const [error, setError] = useState("");
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [loading, setLoading] = useState(false);

  const budget = fields.project
    ? budgets.find(({ fk_proyecto, estado }) => {
      return Number(fk_proyecto) === Number(fields.project) && estado;
    })
    : undefined;

  useEffect(() => {
    if (is_open) {
      setFields({
        ...DEFAULT_FIELDS,
        project,
      });
      setError("");
      setLoading(false);

      // If project was set before hand, display an error on the form if there is no eligible budget
      if (project && !budget) {
        setError("No hay presupuestos abiertos para el proyecto seleccionado");
      }
    }
  }, [is_open]);

  useEffect(() => {
    setFields((prev_state) => ({ ...prev_state, project }));
  }, [project]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    createAssignation(
      fields.date,
      fields.hours,
      fields.person,
      fields.project,
      fields.role?.value,
    )
      .then(async (request) => {
        if (request.ok) {
          setModalOpen(false);
          callback();
        } else {
          const { message } = await request.json();
          setError(message);
        }
      })
      .catch(() => setError("Ocurrio un error al procesar la operacion"))
      .finally(() => setLoading(false));
  };

  return (
    <Fragment>
      <DialogForm
        disabled={!budget}
        error={error}
        handleSubmit={handleSubmit}
        is_loading={loading}
        is_open={is_open}
        setIsOpen={setModalOpen}
        title="Crear Nuevo"
      >
        <AdvancedSelectField
          fullWidth
          name="person"
          label="Recurso"
          onChange={(_event, value) =>
            setFields((prev_value) => ({ ...prev_value, person: value }))}
          options={people.sort(([_a, a], [_b, b]) => a.localeCompare(b))}
          required
          value={fields.person}
        />
        {!project && (
          <Fragment>
            <AdvancedSelectField
              fullWidth
              label="Cliente"
              name="client"
              onChange={(_e, client) =>
                setFields((prev_state) => ({ ...prev_state, client }))}
              options={clients.sort(([_a, a], [_b, b]) => a.localeCompare(b))}
              required
              value={fields.client}
            />
            <SelectField
              disabled={!fields.client}
              error={!!(fields.project && !budget)}
              fullWidth
              helperText={fields.project && !budget
                ? "No hay presupuestos abiertos para este proyecto"
                : ""}
              label="Proyecto"
              name="project"
              onChange={handleChange}
              required
              value={fields.project}
            >
              {projects
                .filter(({ fk_cliente }) => fk_cliente == fields.client)
                .map(({ pk_proyecto, nombre }) => (
                  <option key={pk_proyecto} value={pk_proyecto}>
                    {nombre}
                  </option>
                ))}
            </SelectField>
          </Fragment>
        )}
        {!!budget && (
          <Fragment>
            <SelectField
              disabled
              fullWidth
              label="Presupuesto"
              name="budget"
              value={budget.pk_presupuesto}
            >
              {budgets
                .map(({ pk_presupuesto, nombre }) => (
                  <option key={pk_presupuesto} value={pk_presupuesto}>
                    {nombre}
                  </option>
                ))}
            </SelectField>
            <AsyncSelectField
              fullWidth
              fetchOptions={async () => {
                const roles = await fetchRoleApi()
                  .then(async (response) => {
                    if (response.ok) {
                      return await response.json();
                    }
                    throw new Error();
                  });

                const available_roles = await getBudgetDetails(
                  budget.pk_presupuesto,
                )
                  .then((details) =>
                    details.reduce((res, { fk_rol }) => {
                      res.push(fk_rol);
                      return res;
                    }, [])
                  );

                return roles
                  .filter(({ pk_rol }) => available_roles.includes(pk_rol))
                  .map(({
                    pk_rol,
                    nombre,
                  }) => ({ text: nombre, value: String(pk_rol) }));
              }}
              label="Rol"
              required
              setValue={(value) =>
                setFields((prev_state) => ({ ...prev_state, role: value }))}
              value={fields.role}
            />
          </Fragment>
        )}
        <DateField
          fullWidth
          label="Fecha de asignación"
          name="date"
          onChange={handleChange}
          required
          value={fields.date}
        />
        <TextField
          fullWidth
          inputProps={{
            min: 0.5,
            step: 0.5,
          }}
          label="Horas"
          name="hours"
          onChange={handleChange}
          required
          type="number"
          value={fields.hours}
        />
      </DialogForm>
    </Fragment>
  );
};

const EditModal = ({
  callback,
  data,
  is_open,
  setModalOpen,
}) => {
  const {
    budgets,
    people,
    roles,
  } = useContext(ParameterContext);

  const [error, setError] = useState("");
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (is_open) {
      setFields({
        budget: data.budget,
        date: formatStandardNumberToStandardString(data.date),
        hours: data.hours,
        person: data.person,
        role: data.role,
      });
      setError("");
      setLoading(false);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    updateAssignation(
      data.id,
      {
        hours: fields.hours,
      },
    )
      .then(async (request) => {
        if (request.ok) {
          setModalOpen(false);
          callback();
        } else {
          const { message } = await request.json();
          setError(message);
        }
      })
      .catch(() => setError("Ocurrio un error al procesar la operacion"))
      .finally(() => setLoading(false));
  };

  return (
    <Fragment>
      <DialogForm
        error={error}
        handleSubmit={handleSubmit}
        is_loading={loading}
        is_open={is_open}
        setIsOpen={setModalOpen}
        title="Editar"
      >
        <AdvancedSelectField
          disabled
          fullWidth
          name="person"
          label="Recurso"
          options={people}
          value={fields.person}
        />
        <SelectField
          disabled
          fullWidth
          label="Presupuesto"
          name="budget"
          value={fields.budget}
        >
          {budgets
            .map(({ pk_presupuesto, nombre }) => (
              <option key={pk_presupuesto} value={pk_presupuesto}>
                {nombre}
              </option>
            ))}
        </SelectField>
        <SelectField
          disabled
          fullWidth
          label="Rol"
          name="role"
          value={fields.role}
        >
          {roles
            .map(({ pk_rol, nombre }) => (
              <option key={pk_rol} value={pk_rol}>{nombre}</option>
            ))}
        </SelectField>
        <DateField
          disabled
          fullWidth
          label="Fecha de asignación"
          name="date"
          type="date"
          value={fields.date}
        />
        <TextField
          fullWidth
          inputProps={{
            min: 0.5,
            step: 0.5,
          }}
          label="Horas"
          name="hours"
          onChange={handleChange}
          required
          type="number"
          value={fields.hours}
        />
      </DialogForm>
    </Fragment>
  );
};

const DeleteModal = ({
  callback,
  is_open,
  selected,
  setModalOpen,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteAssignation(id));

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
        callback();
      });
  };

  return (
    <Fragment>
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
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  bar: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function Asignacion() {
  const classes = useStyles();

  const { id: user_id } = useContext(UserContext)[0];
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [alert_open, setAlertOpen] = useState(false);
  const [assignation_table_should_update, setAssignationTableShouldUpdate] =
    useState(false);
  const [error, setError] = useState(null);
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected_client, setSelectedClient] = useState("");
  const [selected_project, setSelectedProject] = useState("");
  const [selected_resource, setSelectedResource] = useState({});
  const [selected_tab, setSelectedTab] = useState(0);
  const [selected_week, setSelectedWeek] = useState("");
  const [selected, setSelected] = useState([]);
  const [assignation_request_data, setAssignationRequestData] = useState([]);
  const [early_close_request_data, setEarlyCloseRequestData] = useState([]);

  const handleTabChange = (tab_id) => {
    setSelectedTab(tab_id);
    if (tab_id === 0) {
      updateAssignationTable();
    }
  };

  const handleAlertClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  const handleEditModalOpen = async (id) => {
    setSelectedResource(await getAssignation(id));
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  //TODO
  //This should spawn a loading animation in the notification queue
  const setAssignationRequest = (id, approved, message) => {
    setAlertOpen(false);
    setError(null);
    updateAssignationRequest(id, approved, message)
      .then(async (response) => {
        if (response.ok) {
          setAlertOpen(true);
        } else {
          const { message } = await response.json();
          setError(message);
          setAlertOpen(true);
        }
      })
      .catch(() => {
        setError("Ocurrio un error al aplicar la solicitud");
        setAlertOpen(true);
      })
      .finally(() => {
        updateAssignationRequestTable();
      });
  };

  //TODO
  //This should spawn a loading animation in the notification queue
  const setEarlyCloseRequest = (id, approved, message) => {
    setAlertOpen(false);
    setError(null);
    updateEarlyCloseRequest(id, approved, message)
      .then(async (response) => {
        if (response.ok) {
          setAlertOpen(true);
        } else {
          const { message } = await response.json();
          setError(message);
          setAlertOpen(true);
        }
      })
      .catch(() => {
        setError("Ocurrio un error al revisar la solicitud");
        setAlertOpen(true);
      })
      .finally(() => {
        updateEarlyCloseRequestTable();
      });
  };

  const updateAssignationTable = () => {
    if (user_id && selected_week && (selected_tab === 0)) {
      setAssignationTableShouldUpdate(true);
    }
  };

  const updateAssignationRequestTable = () => {
    setAlertOpen(false);
    setError(null);
    if (selected_week && (selected_tab === 1)) {
      getAssignationRequestTable(user_id)
        .then(async (response) => {
          if (response.ok) {
            setAssignationRequestData(await response.json());
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          setError("Ocurrio un error al cargar las solicitudes de asignacion");
          setAlertOpen(true);
        });
    }
  };

  const updateEarlyCloseRequestTable = () => {
    setAlertOpen(false);
    setError(null);
    if (selected_week && (selected_tab === 2)) {
      getEarlyCloseRequestTable()
        .then(async (response) => {
          if (response.ok) {
            setEarlyCloseRequestData(await response.json());
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          setError(
            "Ocurrio un error al cargar las solicitudes de cierre de semana",
          );
          setAlertOpen(true);
        });
    }
  };

  useEffect(() => {
    getBudgets().then((budgets) =>
      setParameters((prev_state) => ({ ...prev_state, budgets }))
    );
    getClients().then((clients) => {
      const entries = clients
        .map(({ pk_cliente, nombre }) => [pk_cliente, nombre])
        .filter((x, y) => x[1].localeCompare(y[1]));
      setParameters((prev_state) => ({ ...prev_state, clients: entries }));
    });
    getPeople().then((people) => {
      const entries = people.map((
        { pk_persona, nombre },
      ) => [pk_persona, nombre]);
      setParameters((prev_state) => ({ ...prev_state, people: entries }));
    });
    getProjects()
      .then((projects) => {
        const entries = projects
          .sort(({ nombre: x }, { nombre: y }) => x.localeCompare(y));
        setParameters((prev_state) => ({ ...prev_state, projects: entries }));
      });
    getRoles().then((roles) =>
      setParameters((prev_state) => ({ ...prev_state, roles }))
    );
    getWeeks().then((weeks) =>
      setParameters((prev_state) => ({ ...prev_state, weeks }))
    );
  }, []);

  useEffect(() => {
    setSelectedProject("");
  }, [selected_client]);

  useEffect(() => {
    updateAssignationTable();
    updateAssignationRequestTable();
    updateEarlyCloseRequestTable();
  }, [selected_client, selected_project, selected_week, selected_tab]);

  return (
    <Fragment>
      <Title title="Asignación" />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          callback={updateAssignationTable}
          is_open={is_add_modal_open}
          project={selected_project}
          setModalOpen={setAddModalOpen}
        />
        <EditModal
          callback={updateAssignationTable}
          data={selected_resource}
          is_open={is_edit_modal_open}
          project={selected_project}
          setModalOpen={setEditModalOpen}
        />
        <DeleteModal
          callback={updateAssignationTable}
          is_open={is_delete_modal_open}
          setModalOpen={setDeleteModalOpen}
          selected={selected}
        />
        <Grid container spacing={10}>
          <Grid item xs={4}>
            <AdvancedSelectField
              disabled={selected_tab === 2}
              fullWidth
              label="Cliente"
              onChange={(_event, value) => setSelectedClient(value)}
              options={parameters.clients.sort(([_a, a], [_b, b]) =>
                a.localeCompare(b)
              )}
              value={selected_client}
            />
          </Grid>
          <Grid item xs={4}>
            <SelectField
              disabled={!selected_client || selected_tab === 2}
              fullWidth
              label="Proyecto"
              onChange={(event) => {
                const { value } = event.target;
                setSelectedProject(value);
              }}
              value={selected_project}
            >
              {parameters.projects
                .filter(({ fk_cliente }) => fk_cliente == selected_client)
                .map(({ pk_proyecto, nombre }) => (
                  <option key={pk_proyecto} value={pk_proyecto}>
                    {nombre}
                  </option>
                ))}
            </SelectField>
          </Grid>
          <Grid item xs={4}>
            <SelectField
              fullWidth
              label="Semana"
              onChange={(event) => setSelectedWeek(event.target.value)}
              shrink={true}
              value={selected_week}
            >
              {parameters.weeks
                .map(({ id, start_date }) => {
                  //This adjusts the offset
                  const parsed_date = new Date(start_date);
                  const adjusted_date = new Date(
                    parsed_date.getTime() +
                      (parsed_date.getTimezoneOffset() * 60 * 1000),
                  );
                  return (
                    <option key={id} value={id}>
                      {formatDateAsWeekLocal(adjusted_date)}
                    </option>
                  );
                })}
            </SelectField>
          </Grid>
        </Grid>
      </ParameterContext.Provider>
      <br />
      {selected_week && (
        <div className={classes.bar}>
          <AppBar position="static">
            <Tabs
              value={selected_tab}
              onChange={(_event, value) => handleTabChange(value)}
            >
              <Tab label="Asignaciones" id="simple-tab-0" />
              <Tab
                label="Solicitudes de asignación"
                id="simple-tab-1"
              />
              <Tab
                label="Solicitudes de cierre de semana"
                id="simple-tab-2"
              />
            </Tabs>
          </AppBar>
          <TabPanel index={0} value={selected_tab}>
            <AsyncTable
              columns={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              onTableUpdate={setAssignationTableShouldUpdate}
              search={{
                id_client: selected_client,
                id_project: selected_project,
                id_supervisor: user_id,
                id_week: selected_week,
              }}
              update_table={assignation_table_should_update}
              url={"asignacion/asignacion/table"}
            />
          </TabPanel>
          <TabPanel index={1} value={selected_tab}>
            <AssignationRequestTable
              data={assignation_request_data}
              onUpdateRequest={(row_id, approved, message) =>
                setAssignationRequest(row_id, approved, message)}
              search={{
                id_client: selected_client,
                id_project: selected_project,
                id_week: selected_week,
              }}
            />
          </TabPanel>
          <TabPanel index={2} value={selected_tab}>
            <EarlyCloseRequestTable
              data={early_close_request_data}
              onUpdateRequest={(row_id, approved, message) =>
                setEarlyCloseRequest(row_id, approved, message)}
              search={{
                week_id: selected_week,
              }}
            />
          </TabPanel>
        </div>
      )}
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={alert_open}
        autoHideDuration={3000}
        onClose={handleAlertClose}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleAlertClose}
          severity={error ? "error" : "success"}
        >
          {error || "El registro fue guardado con exito"}
        </Alert>
      </Snackbar>
    </Fragment>
  );
}
