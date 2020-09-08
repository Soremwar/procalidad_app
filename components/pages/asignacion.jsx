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
import {
  makeStyles,
} from "@material-ui/styles";
import {
  Alert,
} from "@material-ui/lab";
import {
  UserContext,
} from "../context/User.jsx";
import {
  formatResponseJson,
} from "../../lib/api/request.js";
import {
  formatStandardNumberToStandardString,
  formatStandardStringToStandardNumber,
  parseDateToStandardNumber,
} from "../../lib/date/mod.js";
import {
  months,
} from "../../lib/date/lang.js";
import {
  fetchAssignationApi,
  fetchAssignationRequestApi,
  fetchClientApi,
  fetchBudgetApi,
  fetchBudgetDetailApi,
  fetchPeopleApi,
  fetchProjectApi,
  fetchRoleApi,
} from "../../lib/api/generator.js";
import AdvancedSelectField from "../common/AdvancedSelectField.jsx";
import AsyncSelectField from "../common/AsyncSelectField.jsx";
import AsyncTable from "../common/AsyncTable/Table.jsx";
import DialogForm from "../common/DialogForm.jsx";
import Title from "../common/Title.jsx";
import RequestTable from "./asignacion/Table.jsx";
import SelectField from "../common/SelectField.jsx";

const parseNumberAsWeek = (date) => {
  date = String(date);
  const day = date.substr(6, 2);
  const month = months.get(date.substr(4, 2));

  return `${day} de ${month}`;
};

const getBudgets = () => fetchBudgetApi().then((x) => x.json());
const getBudgetDetails = (id) => fetchBudgetDetailApi(id).then((x) => x.json());
const getClients = () =>
  fetchClientApi({
    assignated_only: true,
  }).then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getProjects = () =>
  fetchProjectApi({
    assignated_only: true,
  }).then((x) => x.json());
const getRoles = () => fetchRoleApi().then((x) => x.json());
const getWeeks = () => fetchAssignationApi("semanas").then((x) => x.json());

const getAssignation = (id) => fetchAssignationApi(id).then((x) => x.json());

const createAssignation = async (
  budget,
  date,
  hours,
  person,
  role,
) =>
  fetchAssignationApi("", {
    body: JSON.stringify({
      budget,
      date,
      hours,
      person,
      role,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateAssignation = async (
  id,
  budget,
  date,
  hours,
  person,
  role,
) =>
  fetchAssignationApi(id, {
    body: JSON.stringify({
      budget,
      date,
      hours,
      person,
      role,
    }),
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

const updateAssignationRequest = async (id, approved) =>
  fetchAssignationRequestApi(id, {
    body: JSON.stringify({ approved }),
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

const ParameterContext = createContext({
  budgets: [],
  clients: [],
  people: [],
  projects: [],
  roles: [],
});

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

const AddModal = ({
  callback,
  is_open,
  project,
  setModalOpen,
}) => {
  const {
    budgets,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    budget: "",
    date: parseDateToStandardNumber(new Date()),
    hours: "",
    person: "",
    role: null,
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

    createAssignation(
      fields.budget,
      fields.date,
      fields.hours,
      fields.person,
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

  useEffect(() => {
    if (is_open) {
      setFields({
        budget: "",
        date: parseDateToStandardNumber(new Date()),
        hours: "",
        person: "",
        role: null,
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  return (
    <Fragment>
      <DialogForm
        error={error}
        handleSubmit={handleSubmit}
        is_loading={is_loading}
        is_open={is_open}
        setIsOpen={setModalOpen}
        title={"Crear Nuevo"}
      >
        <AdvancedSelectField
          fullWidth
          name="person"
          label="Recurso"
          onChange={(_event, value) =>
            setFields((prev_value) => ({ ...prev_value, person: value }))}
          options={people}
          required
          value={fields.person}
        />
        <SelectField
          fullWidth
          label="Presupuesto"
          margin="dense"
          name="budget"
          onChange={handleChange}
          required
          value={fields.budget}
        >
          {budgets
            .filter(({ fk_proyecto, estado }) => {
              if (project) {
                return fk_proyecto == project && estado;
              } else {
                return estado;
              }
            })
            .map(({ pk_presupuesto, nombre }) => (
              <option key={pk_presupuesto} value={pk_presupuesto}>
                {nombre}
              </option>
            ))}
        </SelectField>
        <AsyncSelectField
          disabled={!fields.budget}
          fullWidth
          fetchOptions={async () => {
            const roles = await fetchRoleApi()
              .then(async (response) => {
                if (response.ok) {
                  return await response.json();
                }
                throw new Error();
              });

            const available_roles = await getBudgetDetails(fields.budget)
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
        <TextField
          fullWidth
          label="Fecha de Asignacion"
          margin="dense"
          name="date"
          onChange={(event) => {
            const { value } = event.target;
            setFields((fields) => ({
              ...fields,
              date: formatStandardStringToStandardNumber(value),
            }));
          }}
          required
          type="date"
          value={formatStandardNumberToStandardString(fields.date)}
        />
        <TextField
          fullWidth
          InputProps={{
            inputProps: {
              min: 0.5,
              step: 0.5,
            },
          }}
          label="Horas"
          margin="dense"
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

  const [fields, setFields] = useState({
    budget: "",
    date: "",
    hours: "",
    person: "",
    role: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [available_roles, setAvailableRoles] = useState([]);

  useEffect(() => {
    if (is_open) {
      setFields({
        budget: data.budget,
        date: data.date,
        hours: data.hours,
        person: data.person,
        role: data.role,
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    updateAssignation(
      data.id,
      fields.budget,
      fields.date,
      fields.hours,
      fields.person,
      fields.role,
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

  useEffect(() => {
    if (fields.budget) {
      getBudgetDetails(fields.budget)
        .then((details) =>
          details.reduce((res, { fk_rol }) => {
            res.push(fk_rol);
            return res;
          }, [])
        )
        .then((available_roles) =>
          roles.filter(({ pk_rol }) => available_roles.includes(pk_rol))
        )
        .then((available_roles) => {
          setAvailableRoles(available_roles);
        });
    } else {
      setFields((fields) => ({ ...fields, role: "" }));
      setAvailableRoles([]);
    }
  }, [fields.budget]);

  return (
    <Fragment>
      <DialogForm
        error={error}
        handleSubmit={handleSubmit}
        is_loading={is_loading}
        is_open={is_open}
        setIsOpen={setModalOpen}
        title={"Editar"}
      >
        <AdvancedSelectField
          disabled
          fullWidth
          name="person"
          label="Recurso"
          onChange={(_event, value) =>
            setFields((prev_value) => ({ ...prev_value, person: value }))}
          options={people}
          required
          value={fields.person}
        />
        <SelectField
          disabled
          fullWidth
          label="Presupuesto"
          margin="dense"
          name="budget"
          onChange={handleChange}
          required
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
          margin="dense"
          name="role"
          onChange={handleChange}
          required
          value={fields.budget && fields.role}
        >
          {available_roles
            .map(({ pk_rol, nombre }) => (
              <option key={pk_rol} value={pk_rol}>{nombre}</option>
            ))}
        </SelectField>
        <TextField
          disabled
          fullWidth
          label="Fecha de Asignacion"
          margin="dense"
          name="date"
          onChange={(event) => {
            const { value } = event.target;
            setFields((fields) => ({
              ...fields,
              date: formatStandardStringToStandardNumber(value),
            }));
          }}
          required
          type="date"
          value={formatStandardNumberToStandardString(fields.date)}
        />
        <TextField
          fullWidth
          InputProps={{
            inputProps: {
              min: 0.5,
              step: 0.5,
            },
          }}
          label="Horas"
          margin="dense"
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

export default () => {
  const classes = useStyles();

  const { id: user_id } = useContext(UserContext)[0];
  const [parameters, setParameters] = useState({
    budgets: [],
    clients: [],
    people: [],
    projects: [],
    roles: [],
    weeks: [],
  });
  const [alert_open, setAlertOpen] = useState(false);
  const [assignation_table_should_update, setAssignationTableShouldUpdate] =
    useState(false);
  const [error, setError] = useState(null);
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [request_table_data, setRequestTableData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selected_client, setSelectedClient] = useState("");
  const [selected_project, setSelectedProject] = useState("");
  const [selected_resource, setSelectedResource] = useState({});
  const [selected_tab, setSelectedTab] = useState(0);
  const [selected_week, setSelectedWeek] = useState("");

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

  const handleRequestUpdate = (id, approved) => {
    setAlertOpen(false);
    setError(null);
    updateAssignationRequest(id, approved)
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
        updateRequestTable();
      });
  };

  const updateAssignationTable = () => {
    if (user_id && selected_week && (selected_tab === 0)) {
      setAssignationTableShouldUpdate(true);
    }
  };

  const updateRequestTable = () => {
    setAlertOpen(false);
    setError(null);
    if (selected_week && (selected_tab === 1)) {
      getAssignationRequestTable(user_id)
        .then(async (response) => {
          if (response.ok) {
            setRequestTableData(await response.json());
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          setError("Ocurrio un error al cargar las solicitudes");
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
    getProjects().then((projects) => {
      const entries = projects
        .map((
          { pk_proyecto, nombre, fk_cliente },
        ) => [pk_proyecto, nombre, fk_cliente])
        .filter((x, y) => x[1].localeCompare(y[1]));
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
    updateRequestTable();
  }, [selected_client, selected_project, selected_week, selected_tab]);

  return (
    <Fragment>
      <Title title={"Asignacion"} />
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
              fullWidth
              label="Cliente"
              onChange={(_event, value) => setSelectedClient(value)}
              options={parameters.clients}
              required
              value={selected_client}
            />
          </Grid>
          <Grid item xs={4}>
            <AdvancedSelectField
              disabled={!selected_client}
              fullWidth
              label="Proyecto"
              onChange={(_event, value) => setSelectedProject(value)}
              options={parameters.projects.filter(([_x, _y, client]) =>
                client == selected_client
              )}
              required
              value={selected_project}
            />
          </Grid>
          <Grid item xs={4}>
            <SelectField
              fullWidth
              label="Semana"
              onChange={(event) => setSelectedWeek(event.target.value)}
              value={selected_week}
            >
              {parameters.weeks
                .map(({ code, date }) => (
                  <option key={code} value={code}>
                    {parseNumberAsWeek(date)}
                  </option>
                ))}
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
              <Tab label="Asignaciones Activas" id="simple-tab-0" />
              <Tab
                label="Solicitudes"
                id="simple-tab-1"
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
            <RequestTable
              data={request_table_data}
              onUpdateRequest={(row_id, approved) =>
                handleRequestUpdate(row_id, approved)}
              search={{
                id_client: selected_client,
                id_project: selected_project,
                id_week: selected_week,
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
};
