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
  parseDateToStandardNumber,
  parseStandardNumber,
} from "../../lib/date/mod.js";
import {
  months,
} from "../../lib/date/lang.js";
import {
  fetchAssignationApi,
  fetchClientApi,
  fetchBudgetApi,
  fetchBudgetDetailApi,
  fetchPeopleApi,
  fetchProjectApi,
  fetchAssignationRequestApi,
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

const formatDateToInputDate = (date) => {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;

  return `${year}-${month}-${day}`;
};

const getBudgets = () => fetchBudgetApi().then((x) => x.json());
const getBudgetDetails = (id) => fetchBudgetDetailApi(id).then((x) => x.json());
const getClients = () => fetchClientApi().then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getProjects = () => fetchProjectApi().then((x) => x.json());
const getWeeks = () => fetchAssignationApi("semanas").then((x) => x.json());

const getAssignation = (id) => fetchAssignationApi(id).then((x) => x.json());

const createAssignation = async (form_data) =>
  fetchAssignationApi("", {
    method: "POST",
    body: form_data,
  });

const updateAssignation = async (id, form_data) =>
  fetchAssignationApi(id, {
    method: "PUT",
    body: form_data,
  });

const deleteAssignation = async (id) =>
  fetchAssignationApi(id, {
    method: "DELETE",
  });

const getAssignationRequestTable = async () =>
  fetchAssignationRequestApi("table");

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
];

const ParameterContext = createContext({
  budgets: [],
  clients: [],
  people: [],
  projects: [],
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
    person: "",
    budget: "",
    role: "",
    date: parseDateToStandardNumber(new Date()),
    hours: "",
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

    createAssignation(new URLSearchParams(fields))
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
        person: "",
        budget: "",
        role: "",
        date: parseDateToStandardNumber(new Date()),
        hours: "",
      });
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
            .filter(({ fk_proyecto }) => fk_proyecto == project)
            .map(({ pk_presupuesto, nombre }) => (
              <option key={pk_presupuesto} value={pk_presupuesto}>
                {nombre}
              </option>
            ))}
        </SelectField>
        <AsyncSelectField
          disabled={!fields.budget}
          fullWidth
          handleSource={async (source) => {
            const available_roles = await getBudgetDetails(fields.budget)
              .then((details) =>
                details.reduce((res, { fk_rol }) => {
                  res.push(fk_rol);
                  return res;
                }, [])
              );

            return Object.values(source)
              .filter(({ pk_rol }) => available_roles.includes(pk_rol))
              .map(({
                pk_rol,
                nombre,
              }) => {
                return { value: String(pk_rol), text: nombre };
              });
          }}
          label="Rol"
          margin="dense"
          name="role"
          onChange={handleChange}
          required
          source={`operaciones/rol`}
          value={fields.budget && fields.role}
        />
        <TextField
          fullWidth
          label="Fecha de Asignacion"
          margin="dense"
          name="date"
          onChange={(event) => {
            const date = parseDateToStandardNumber(
              new Date(event.target.value),
            );
            setFields((fields) => ({ ...fields, date: date }));
          }}
          required
          type="date"
          value={formatDateToInputDate(
            parseStandardNumber(fields.date) || new Date(),
          )}
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
  project,
  setModalOpen,
}) => {
  const {
    budgets,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    person: "",
    budget: "",
    role: "",
    date: "",
    hours: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        person: data.person,
        budget: data.budget,
        role: data.role,
        date: data.date,
        hours: data.hours,
      });
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    updateAssignation(data.id, new URLSearchParams(fields))
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
            .filter(({ fk_proyecto }) => fk_proyecto == project)
            .map(({ pk_presupuesto, nombre }) => (
              <option key={pk_presupuesto} value={pk_presupuesto}>
                {nombre}
              </option>
            ))}
        </SelectField>
        <AsyncSelectField
          disabled
          fullWidth
          handleSource={async (source) => {
            const available_roles = await getBudgetDetails(fields.budget)
              .then((details) =>
                details.reduce((res, { fk_rol }) => {
                  res.push(fk_rol);
                  return res;
                }, [])
              );

            return Object.values(source)
              .filter(({ pk_rol }) => {
                if (!fields.budget) return true;
                return available_roles.includes(pk_rol);
              })
              .map(({
                pk_rol,
                nombre,
              }) => {
                return { value: String(pk_rol), text: nombre };
              });
          }}
          label="Rol"
          margin="dense"
          name="role"
          onChange={handleChange}
          required
          source={`operaciones/rol`}
          value={fields.budget && fields.role}
        />
        <TextField
          disabled
          fullWidth
          label="Fecha de Asignacion"
          margin="dense"
          name="date"
          onChange={(event) => {
            const date = parseDateToStandardNumber(
              new Date(event.target.value),
            );
            setFields((fields) => ({ ...fields, date }));
          }}
          required
          type="date"
          value={formatDateToInputDate(
            parseStandardNumber(fields.date) || new Date(),
          )}
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

  const [userState] = useContext(UserContext);
  const [parameters, setParameters] = useState({
    budgets: [],
    clients: [],
    people: [],
    projects: [],
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
      .then((response) => {
        if (response.ok) {
          setAlertOpen(true);
        } else {
          throw new Error();
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
    if (selected_project && selected_week && (selected_tab === 0)) {
      setAssignationTableShouldUpdate(true);
    }
  };

  const updateRequestTable = () => {
    setAlertOpen(false);
    setError(null);
    if (selected_project && selected_week && (selected_tab === 1)) {
      getAssignationRequestTable()
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
    getClients().then((clients) =>
      setParameters((prev_state) => ({ ...prev_state, clients }))
    );
    getPeople().then((people) => {
      const entries = people.map((
        { pk_persona, nombre },
      ) => [pk_persona, nombre]);
      setParameters((prev_state) => ({ ...prev_state, people: entries }));
    });
    getProjects().then((projects) =>
      setParameters((prev_state) => ({ ...prev_state, projects }))
    );
    getWeeks().then((weeks) =>
      setParameters((prev_state) => ({ ...prev_state, weeks }))
    );
  }, []);

  useEffect(() => {
    setSelectedProject("");
  }, [selected_client, userState.id]);

  useEffect(() => {
    updateAssignationTable();
    updateRequestTable();
  }, [selected_project, selected_week, selected_tab]);

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
            <SelectField
              fullWidth
              label="Cliente"
              onChange={(event) => setSelectedClient(event.target.value)}
              value={selected_client}
            >
              {parameters.clients.map(({ pk_cliente, nombre }) => (
                <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
              ))}
            </SelectField>
          </Grid>
          <Grid item xs={4}>
            <SelectField
              disabled={!selected_client}
              fullWidth
              label="Proyecto"
              onChange={(event) => setSelectedProject(event.target.value)}
              value={selected_project}
            >
              {parameters.projects
                .filter(({ fk_cliente, fk_supervisor }) =>
                  fk_cliente == selected_client &&
                  fk_supervisor == userState.id
                )
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
      {selected_project && selected_week && (
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
                id_project: selected_project,
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
