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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FrappeGantt, Task, ViewMode } from "frappe-gantt-react";
import { formatResponseJson } from "../../../lib/api/request.ts";
import {
  formatStandardNumberToStandardString,
  parseDateToStandardNumber,
} from "../../../lib/date/mod.js";
import {
  fetchBudgetApi,
  fetchBudgetDetailApi,
  fetchClientApi,
  fetchPeopleApi,
  fetchPositionApi,
  fetchProjectApi,
  fetchResourceApi,
  fetchRoleApi,
  fetchSubAreaApi,
  fetchTimeApi,
} from "../../../lib/api/generator.js";

import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncSelectField from "../../common/AsyncSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DateField from "../../common/DateField.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

import ResourceHeatmap from "./recurso/ResourceHeatmap.jsx";
import DetailHeatmap from "./recurso/DetailHeatmap.jsx";

/** @return Promise<Array<{nombre: string}>> */
const getBudgets = () => fetchBudgetApi().then((x) => x.json());
const getBudgetDetails = (id) => fetchBudgetDetailApi(id).then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getClients = () => fetchClientApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getPositions = () => fetchPositionApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getProjects = () => fetchProjectApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getPeople = () => fetchPeopleApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getRoles = () => fetchRoleApi().then((x) => x.json());
const getResource = (id) => fetchResourceApi(id).then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getSubAreas = () => fetchSubAreaApi().then((x) => x.json());
const getResourceGantt = (type, person, project) => {
  const params = new URLSearchParams(Object.fromEntries([
    ["person", person],
    ["project", project],
    ["type", type],
  ].filter(([_index, value]) => value)));
  return fetchResourceApi(`gantt?${params.toString()}`).then((x) => x.json());
};
const getBlacklistedDates = (start_date, end_date) => {
  const params = new URLSearchParams({
    start_date,
    end_date,
  });
  return fetchTimeApi(`blacklist?${params.toString()}`).then((x) => x.json());
};
const getResourceHeatmap = (
  type,
  sub_area,
  position,
  role,
) => {
  return fetchResourceApi(`heatmap?type=resource`, {
    body: JSON.stringify({ type, sub_area, position, role }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).then((x) => x.json());
};
const getDetailHeatmap = (
  person,
) => {
  return fetchResourceApi(`heatmap?type=detail`, {
    body: JSON.stringify({ person }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).then((x) => x.json());
};

const createResource = async (
  assignation,
  project,
  hours,
  person,
  role,
  start_date,
) =>
  fetchResourceApi("", {
    body: JSON.stringify({
      assignation,
      project,
      hours,
      person,
      role,
      start_date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateResource = async (
  id,
  assignation,
  project,
  hours,
  person,
  role,
  start_date,
) =>
  fetchResourceApi(id, {
    body: JSON.stringify({
      assignation,
      project,
      hours,
      person,
      role,
      start_date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteResource = async (id) =>
  fetchResourceApi(id, {
    method: "DELETE",
  });

const detail_headers = [
  {
    id: "project",
    numeric: false,
    disablePadding: false,
    label: "Proyecto",
    searchable: true,
  },
  {
    id: "start_date",
    numeric: false,
    disablePadding: false,
    label: "Fecha inicio",
    searchable: true,
  },
  {
    id: "end_date",
    numeric: false,
    disablePadding: false,
    label: "Fecha fin",
    searchable: true,
  },
  {
    id: "assignation",
    numeric: false,
    disablePadding: false,
    label: "Porcentaje",
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

const resource_headers = [
  {
    id: "person",
    numeric: false,
    disablePadding: false,
    label: "Recurso",
    searchable: true,
  },
  {
    id: "start_date",
    numeric: false,
    disablePadding: false,
    label: "Fecha inicio",
    searchable: true,
  },
  {
    id: "end_date",
    numeric: false,
    disablePadding: false,
    label: "Fecha fin",
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

export const ParameterContext = createContext({
  blacklisted_dates: [],
  budgets: [],
  clients: [],
  people: [],
  positions: [],
  projects: [],
  roles: [],
  sub_areas: [],
});

const NotSelectedPersonDialog = ({
  open,
  setOpen,
}) => (
  <Dialog
    onClose={() => setOpen(false)}
    open={open}
  >
    <DialogTitle>Datos incompletos</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Seleccione el recurso a agregar antes de acceder a este menu
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpen(false)} color="primary">Cerrar</Button>
    </DialogActions>
  </Dialog>
);

const Gantt = ({
  tasks,
  viewMode,
}) => {
  return (
    <FrappeGantt
      tasks={tasks}
      viewMode={viewMode}
    />
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const AddModal = ({
  callback,
  is_open,
  person,
  setModalOpen,
}) => {
  const {
    budgets,
    clients,
    projects,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    assignation: "",
    budget: "",
    client: "",
    hours: "",
    project: "",
    role: null,
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

    createResource(
      fields.assignation,
      fields.project,
      fields.hours,
      person,
      fields.role?.value,
      fields.start_date,
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
        assignation: "",
        budget: "",
        client: "",
        hours: "",
        person: "",
        project: "",
        role: null,
        start_date: "",
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  return (
    <Fragment>
      {person
        ? (
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
              label="Cliente"
              name="client"
              onChange={handleChange}
              required
              value={fields.client}
            >
              {clients.map(({ pk_cliente, nombre }) => (
                <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
              ))}
            </SelectField>
            <SelectField
              disabled={!fields.client}
              fullWidth
              label="Proyecto"
              name="project"
              onChange={handleChange}
              required
              value={fields.client && fields.project}
            >
              {projects
                .filter(({ fk_cliente }) => fk_cliente == fields.client)
                .map(({ pk_proyecto, nombre }) => (
                  <option key={pk_proyecto} value={pk_proyecto}>
                    {nombre}
                  </option>
                ))}
            </SelectField>
            <SelectField
              disabled={!fields.client && !fields.project}
              fullWidth
              label="Presupuesto"
              name="budget"
              onChange={handleChange}
              required
              value={fields.client && fields.project && fields.budget}
            >
              {budgets
                .filter(({ fk_proyecto, estado }) =>
                  fk_proyecto == fields.project && estado
                )
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
            <DateField
              fullWidth
              label="Fecha inicio"
              name="start_date"
              onChange={handleChange}
              required
              value={fields.start_date}
            />
            <TextField
              fullWidth
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 100,
                },
              }}
              label="% Asignación"
              name="assignation"
              onChange={handleChange}
              required
              type="number"
              value={fields.assignation}
            />
            <TextField
              fullWidth
              InputProps={{
                inputProps: {
                  min: 0,
                },
              }}
              label="Horas"
              name="hours"
              onChange={handleChange}
              required
              type="number"
              value={fields.hours}
            />
          </DialogForm>
        )
        : (
          <NotSelectedPersonDialog
            open={is_open}
            setOpen={setModalOpen}
          />
        )}
    </Fragment>
  );
};

const EditModal = ({
  callback,
  data,
  is_open,
  person,
  setModalOpen,
}) => {
  const {
    budgets,
    clients,
    projects,
    roles,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    assignation: "",
    budget: "",
    client: "",
    hours: "",
    project: "",
    role: "",
    start_date: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [available_roles, setAvailableRoles] = useState([]);

  useEffect(() => {
    if (is_open) {
      setFields({
        assignation: data.porcentaje,
        budget: data.fk_presupuesto,
        client: data.fk_cliente,
        hours: data.horas,
        project: data.fk_proyecto,
        role: data.fk_rol,
        start_date: formatStandardNumberToStandardString(data.fecha_inicio),
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

    updateResource(
      data.pk_recurso,
      fields.assignation,
      fields.project,
      fields.hours,
      person,
      fields.role,
      fields.start_date,
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
      {person
        ? (
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
              label="Cliente"
              name="client"
              onChange={handleChange}
              required
              value={fields.client}
            >
              {clients.map(({ pk_cliente, nombre }) => (
                <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
              ))}
            </SelectField>
            <SelectField
              disabled={!fields.client}
              fullWidth
              label="Proyecto"
              name="project"
              onChange={handleChange}
              required
              value={fields.client && fields.project}
            >
              {projects
                .filter(({ fk_cliente }) => fk_cliente == fields.client)
                .map(({ pk_proyecto, nombre }) => (
                  <option key={pk_proyecto} value={pk_proyecto}>
                    {nombre}
                  </option>
                ))}
            </SelectField>
            <SelectField
              disabled={!(fields.client && fields.project)}
              fullWidth
              label="Presupuesto"
              name="budget"
              onChange={handleChange}
              required
              value={fields.client && fields.project && fields.budget}
            >
              {budgets
                .filter(({ fk_proyecto }) => fk_proyecto == fields.project)
                .map(({ pk_presupuesto, nombre }) => (
                  <option key={pk_presupuesto} value={pk_presupuesto}>
                    {nombre}
                  </option>
                ))}
            </SelectField>
            <SelectField
              disabled={!(fields.client && fields.project && fields.budget)}
              fullWidth
              label="Rol"
              name="role"
              onChange={handleChange}
              required
              value={fields.client && fields.project && fields.budget &&
                fields.role}
            >
              {available_roles
                .map(({ pk_rol, nombre }) => (
                  <option key={pk_rol} value={pk_rol}>{nombre}</option>
                ))}
            </SelectField>
            <DateField
              fullWidth
              label="Fecha inicio"
              name="start_date"
              onChange={handleChange}
              required
              value={fields.start_date}
            />
            <TextField
              fullWidth
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 100,
                },
              }}
              label="% Asignación"
              name="assignation"
              onChange={handleChange}
              required
              type="number"
              value={fields.assignation}
            />
            <TextField
              fullWidth
              InputProps={{
                inputProps: {
                  min: 0,
                },
              }}
              label="Horas"
              name="hours"
              onChange={handleChange}
              required
              type="number"
              value={fields.hours}
            />
          </DialogForm>
        )
        : (
          <NotSelectedPersonDialog
            open={is_open}
            setOpen={setModalOpen}
          />
        )}
    </Fragment>
  );
};

const DeleteModal = ({
  callback,
  is_open,
  person,
  selected,
  setModalOpen,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteResource(id));

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
      {person
        ? (
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
              Esta operacion no se puede deshacer. ¿Esta seguro que desea
              eliminar estos <b>{selected.length}</b>
              &nbsp;elementos?
            </DialogContentText>
          </DialogForm>
        )
        : (
          <NotSelectedPersonDialog
            open={is_open}
            setOpen={setModalOpen}
          />
        )}
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  bar: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const TODAY = parseDateToStandardNumber(new Date());
const MAX_DATE_HEATMAP = (() => {
  const date = new Date();
  date.setMonth(new Date().getMonth() + 2);
  return parseDateToStandardNumber(date);
})();

export default function ResourcePlanning() {
  const classes = useStyles();

  const [parameters, setParameters] = useState({
    blacklisted_dates: [],
    budgets: [],
    clients: [],
    people: [],
    positions: [],
    projects: [],
    roles: [],
    sub_areas: [],
  });
  const [heatmap_should_update, setHeatmapShouldUpdate] = useState(false);
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected_person, setSelectedPerson] = useState("");
  const [selected_resource, setSelectedResource] = useState({});
  const [selected_tab, setSelectedTab] = useState(0);
  const [table_items_selected, setTableItemsSelected] = useState([]);
  const [table_should_update, setTableShouldUpdate] = useState(false);
  const [tasks, setTasks] = useState([]);

  const handleEditModalOpen = async (id) => {
    setSelectedResource(await getResource(id));
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = (selected) => {
    setTableItemsSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateGantt = async () => {
    let tasks;
    if (!selected_person) {
      tasks = await getResourceGantt("resource")
        .then((resources) => {
          return resources
            .map(({
              person,
              start_date,
              end_date,
            }, index) =>
              new Task({
                id: index,
                name: person,
                start: formatStandardNumberToStandardString(start_date),
                end: formatStandardNumberToStandardString(end_date),
                progress: 0,
              })
            );
        });
    } else {
      tasks = await getResourceGantt("detail", selected_person)
        .then((resources) => {
          return resources
            .map(({
              assignation,
              project,
              start_date,
              end_date,
            }, index) =>
              new Task({
                id: index,
                name: `${project} - ${assignation}%`,
                start: formatStandardNumberToStandardString(start_date),
                end: formatStandardNumberToStandardString(end_date),
                progress: 100,
              })
            );
        });
    }
    if (selected_tab === 1) {
      setTasks(tasks);
    } else {
      setTasks([]);
    }
  };

  const updateHeatmap = () => {
    setHeatmapShouldUpdate(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    getBlacklistedDates(
      TODAY,
      MAX_DATE_HEATMAP,
    ).then((blacklisted_dates) =>
      setParameters((prev_state) => ({ ...prev_state, blacklisted_dates }))
    );
    getBudgets().then((budgets) =>
      setParameters((prev_state) => ({
        ...prev_state,
        budgets: budgets.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getClients().then((clients) =>
      setParameters((prev_state) => ({
        ...prev_state,
        clients: clients.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getPeople().then((people) => {
      const entries = people
        .map(({ pk_persona, nombre }) => [pk_persona, nombre])
        .sort(([_x, x], [_y, y]) => x.localeCompare(y));
      setParameters((prev_state) => ({ ...prev_state, people: entries }));
    });
    getPositions().then((positions) =>
      setParameters((prev_state) => ({
        ...prev_state,
        positions: positions.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getProjects().then((projects) =>
      setParameters((prev_state) => ({
        ...prev_state,
        projects: projects.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getRoles().then((roles) =>
      setParameters((prev_state) => ({
        ...prev_state,
        roles: roles.sort(({ nombre: x }, { nombre: y }) => x.localeCompare(y)),
      }))
    );
    getSubAreas().then((sub_areas) =>
      setParameters((prev_state) => ({
        ...prev_state,
        sub_areas: sub_areas.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
  }, []);

  useEffect(() => {
    switch (selected_tab) {
      case 0:
        setHeatmapShouldUpdate(false);
        updateTable();
        break;
      case 1:
        setTableShouldUpdate(false);
        setHeatmapShouldUpdate(false);
        updateGantt();
        break;
      case 2:
        setTableShouldUpdate(false);
        updateHeatmap();
        break;
    }
  }, [selected_person, selected_tab]);

  return (
    <Fragment>
      <Title title={"Planeación por recurso"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          callback={updateTable}
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          person={selected_person}
        />
        <EditModal
          callback={updateTable}
          data={selected_resource}
          is_open={is_edit_modal_open}
          person={selected_person}
          setModalOpen={setEditModalOpen}
        />
      </ParameterContext.Provider>
      <DeleteModal
        callback={updateTable}
        is_open={is_delete_modal_open}
        person={selected_person}
        setModalOpen={setDeleteModalOpen}
        selected={table_items_selected}
      />
      <Grid container spacing={10}>
        <Grid item xs={6}>
          <AdvancedSelectField
            fullWidth
            label="Recurso"
            onChange={(_event, value) => setSelectedPerson(value)}
            options={parameters.people}
            value={selected_person}
          />
        </Grid>
      </Grid>
      <br />
      <div className={classes.bar}>
        <AppBar position="static">
          <Tabs
            value={selected_tab}
            onChange={(_event, value) => setSelectedTab(value)}
          >
            <Tab label="Planeación" {...a11yProps(0)} />
            <Tab label="Gantt" {...a11yProps(1)} />
            <Tab label="Disponibilidad" {...a11yProps(2)} />
          </Tabs>
        </AppBar>
        <TabPanel value={selected_tab} index={0}>
          <Widget noBodyPadding>
            {selected_person
              ? (
                <AsyncTable
                  columns={detail_headers}
                  onAddClick={() => setAddModalOpen(true)}
                  onEditClick={(id) => handleEditModalOpen(id)}
                  onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
                  onTableUpdate={() => setTableShouldUpdate(false)}
                  search={{
                    id_person: selected_person,
                  }}
                  request_parameters={{
                    type: "detail",
                  }}
                  update_table={table_should_update}
                  url={"planeacion/recurso/table"}
                />
              )
              : (
                <AsyncTable
                  columns={resource_headers}
                  onAddClick={() => setAddModalOpen(true)}
                  onEditClick={(id) => handleEditModalOpen(id)}
                  onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
                  onTableUpdate={() => setTableShouldUpdate(false)}
                  request_parameters={{
                    type: "resource",
                  }}
                  update_table={table_should_update}
                  url={"planeacion/recurso/table"}
                />
              )}
          </Widget>
        </TabPanel>
        <TabPanel
          index={1}
          value={selected_tab}
        >
          {tasks.length
            ? (
              <Gantt
                tasks={tasks}
                viewMode={ViewMode.Week}
              />
            )
            : (
              <Typography variant="h3" gutterBottom>
                No existen datos para mostrar
              </Typography>
            )}
        </TabPanel>
        <TabPanel
          index={2}
          value={selected_tab}
        >
          <ParameterContext.Provider value={parameters}>
            {!selected_person
              ? (
                <ResourceHeatmap
                  blacklisted_dates={parameters.blacklisted_dates}
                  end_date={MAX_DATE_HEATMAP}
                  getSource={(type, sub_area, position, role) =>
                    getResourceHeatmap(type, sub_area, position, role)}
                  setShouldUpdate={setHeatmapShouldUpdate}
                  should_update={heatmap_should_update}
                  start_date={TODAY}
                />
              )
              : (
                <DetailHeatmap
                  blacklisted_dates={parameters.blacklisted_dates}
                  end_date={MAX_DATE_HEATMAP}
                  getSource={() => getDetailHeatmap(selected_person)}
                  onUpdate={() => setHeatmapShouldUpdate(false)}
                  should_update={heatmap_should_update}
                  start_date={TODAY}
                />
              )}
          </ParameterContext.Provider>
        </TabPanel>
      </div>
    </Fragment>
  );
}
