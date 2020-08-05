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
} from "@material-ui/core";
import {
  makeStyles,
} from "@material-ui/styles";
import {
  FrappeGantt,
  Task,
  ViewMode,
} from "frappe-gantt-react";
import {
  formatResponseJson,
} from "../../../lib/api/request.js";
import {
  formatStandardNumberToStandardString,
  formatStandardStringToStandardNumber,
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
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

import ResourceHeatmap from "./recurso/ResourceHeatmap.jsx";
import DetailHeatmap from "./recurso/DetailHeatmap.jsx";

const global_tasks = [
  {
    id: "Task 1",
    name: "William Morales",
    start: "2016-12-28",
    end: "2017-1-15",
    progress: 20,
  },
].map((x) => new Task(x));

const getBudgets = () => fetchBudgetApi().then((x) => x.json());
const getBudgetDetails = (id) => fetchBudgetDetailApi(id).then((x) => x.json());
const getClients = () => fetchClientApi().then((x) => x.json());
const getPositions = () => fetchPositionApi().then((x) => x.json());
const getProjects = () => fetchProjectApi().then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getRoles = () => fetchRoleApi().then((x) => x.json());
const getResource = (id) => fetchResourceApi(id).then((x) => x.json());
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

const createResource = async (form_data) => {
  return await fetchResourceApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateResource = async (id, form_data) => {
  return await fetchResourceApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteResource = async (id) => {
  return await fetchResourceApi(id, {
    method: "DELETE",
  });
};

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
    label: "Fecha Inicio",
    searchable: true,
  },
  {
    id: "end_date",
    numeric: false,
    disablePadding: false,
    label: "Fecha Fin",
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
    label: "Fecha Inicio",
    searchable: true,
  },
  {
    id: "end_date",
    numeric: false,
    disablePadding: false,
    label: "Fecha Fin",
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
    client: "",
    project: "",
    budget: "",
    role: "",
    start_date: parseDateToStandardNumber(new Date()),
    assignation: "",
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

    createResource(new URLSearchParams({ ...fields, person }))
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
        client: "",
        project: "",
        person: "",
        budget: "",
        role: "",
        start_date: parseDateToStandardNumber(new Date()),
        assignation: "",
        hours: "",
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
              margin="dense"
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
              margin="dense"
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
              margin="dense"
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
              label="Fecha Inicio"
              margin="dense"
              name="start_date"
              onChange={(event) => {
                const { value } = event.target;
                setFields((fields) => ({
                  ...fields,
                  start_date: formatStandardStringToStandardNumber(value),
                }));
              }}
              required
              type="date"
              value={formatStandardNumberToStandardString(fields.start_date)}
            />
            <TextField
              fullWidth
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 100,
                },
              }}
              label="% Asignacion"
              margin="dense"
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
              margin="dense"
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
    client: "",
    project: "",
    person: "",
    budget: "",
    role: "",
    start_date: parseDateToStandardNumber(new Date()),
    assignation: "",
    hours: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [available_roles, setAvailableRoles] = useState([]);

  useEffect(() => {
    if (is_open) {
      setFields({
        client: data.fk_cliente,
        project: data.fk_proyecto,
        budget: data.fk_presupuesto,
        role: data.fk_rol,
        start_date: data.fecha_inicio,
        assignation: data.porcentaje,
        hours: data.horas,
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

    updateResource(data.pk_recurso, new URLSearchParams({ ...fields, person }))
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
              margin="dense"
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
              margin="dense"
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
              margin="dense"
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
              margin="dense"
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
            <TextField
              fullWidth
              label="Fecha Inicio"
              margin="dense"
              name="start_date"
              onChange={(event) => {
                const { value } = event.target;
                setFields((fields) => ({
                  ...fields,
                  start_date: formatStandardStringToStandardNumber(value),
                }));
              }}
              required
              type="date"
              value={formatStandardNumberToStandardString(fields.start_date)}
            />
            <TextField
              fullWidth
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 100,
                },
              }}
              label="% Asignacion"
              margin="dense"
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
              margin="dense"
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

export default () => {
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

  const updateGantt = () => {
    if (!selected_person) {
      getResourceGantt("resource").then((resources) => {
        const tasks = resources
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

        setTasks(tasks);
      });
    } else {
      getResourceGantt("detail", selected_person).then((resources) => {
        const tasks = resources
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

        setTasks(tasks);
      });
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
    getPositions().then((positions) =>
      setParameters((prev_state) => ({ ...prev_state, positions }))
    );
    getProjects().then((projects) =>
      setParameters((prev_state) => ({ ...prev_state, projects }))
    );
    getRoles().then((roles) =>
      setParameters((prev_state) => ({ ...prev_state, roles }))
    );
    getSubAreas().then((sub_areas) =>
      setParameters((prev_state) => ({ ...prev_state, sub_areas }))
    );
  }, []);

  useEffect(() => {
    switch (selected_tab) {
      case 0:
        updateTable();
        break;
      case 1:
        updateGantt();
        break;
      case 2:
        updateHeatmap();
        break;
    }
  }, [selected_person, selected_tab]);

  return (
    <Fragment>
      <Title title={"Planeacion por Recurso"} />
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
            <Tab label="Planeacion" {...a11yProps(0)} />
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
          <Gantt
            tasks={tasks.length ? tasks : global_tasks}
            viewMode={ViewMode.Week}
          />
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
                  onUpdate={() => setHeatmapShouldUpdate(true)}
                  should_update={heatmap_should_update}
                  start_date={TODAY}
                />
              )
              : (
                <DetailHeatmap
                  blacklisted_dates={parameters.blacklisted_dates}
                  end_date={MAX_DATE_HEATMAP}
                  getSource={() => getDetailHeatmap(selected_person)}
                  onUpdate={() => setHeatmapShouldUpdate(true)}
                  should_update={heatmap_should_update}
                  start_date={TODAY}
                />
              )}
          </ParameterContext.Provider>
        </TabPanel>
      </div>
    </Fragment>
  );
};
