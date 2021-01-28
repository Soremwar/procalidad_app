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
import { makeStyles } from "@material-ui/styles";
import { FrappeGantt, Task, ViewMode } from "frappe-gantt-react";
import { formatResponseJson } from "../../../lib/api/request.ts";
import { formatStandardNumberToStandardString } from "../../../lib/date/mod.js";
import {
  fetchClientApi,
  fetchPeopleApi,
  fetchProjectApi,
  fetchResourceApi,
  fetchRoleApi,
} from "../../../lib/api/generator.js";

import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncSelectField from "../../common/AsyncSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DateField from "../../common/DateField.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

/** @return Promise<Array<{nombre: string}>> */
const getClients = () => fetchClientApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getPeople = () => fetchPeopleApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getProjects = () => fetchProjectApi().then((x) => x.json());
const getResource = (id) => fetchResourceApi(id).then((x) => x.json());
const getResourceGantt = (project) => {
  const params = new URLSearchParams(Object.fromEntries([
    ["project", project],
    ["type", "project"],
  ].filter(([_index, value]) => value)));
  return fetchResourceApi(`gantt?${params.toString()}`).then((x) => x.json());
};
const getRoles = (project) =>
  fetchRoleApi({
    params: {
      proyecto: project,
    },
  });

const createResource = async (
  assignation,
  hours,
  person,
  project,
  role,
  start_date,
) =>
  fetchResourceApi("", {
    body: JSON.stringify({
      assignation,
      hours,
      person,
      project,
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
  hours,
  person,
  project,
  role,
  start_date,
) =>
  fetchResourceApi(id, {
    body: JSON.stringify({
      assignation,
      hours,
      person,
      project,
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
  {
    id: "assignation",
    numeric: false,
    disablePadding: false,
    label: "Porcentaje",
    searchable: true,
  },
];

const DEFAULT_PARAMETERS = {
  clients: [],
  people: [],
  projects: [],
};

const ParameterContext = createContext(DEFAULT_PARAMETERS);

const NotSelectedProjectDialog = ({
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
        Seleccione el proyecto a agregar antes de acceder a este menu
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpen(false)} color="primary">Cerrar</Button>
    </DialogActions>
  </Dialog>
);

//TODO
//Refactor the hell out of this
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
  project,
  setModalOpen,
}) => {
  const {
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    assignation: "",
    hours: "",
    person: "",
    role: "",
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
      Number(fields.assignation),
      Number(fields.hours),
      Number(fields.person),
      Number(project),
      Number(fields.role.value),
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
        hours: "",
        person: "",
        role: "",
        start_date: "",
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  return (
    <Fragment>
      {project
        ? (
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
            <AsyncSelectField
              fullWidth
              fetchOptions={async () => {
                const roles = await getRoles(project)
                  .then(async (response) => {
                    if (response.ok) {
                      return await response.json();
                    }
                    throw new Error();
                  });

                return roles
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
              type="date"
              value={fields.start_date}
            />
            <TextField
              fullWidth
              inputProps={{
                max: 100,
                min: 1,
              }}
              label="% Asignación"
              margin="dense"
              name="assignation"
              onChange={handleChange}
              required
              type="number"
              value={fields.assignation}
            />
            <TextField
              fullWidth
              inputProps={{
                min: 1,
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
          <NotSelectedProjectDialog
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
  setModalOpen,
}) => {
  const {
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    assignation: "",
    hours: "",
    person: "",
    role: "",
    start_date: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [available_roles, setAvailableRoles] = useState([]);

  useEffect(() => {
    if (is_open) {
      setError(null);
      setLoading(false);

      (async () => {
        await getRoles(data.fk_proyecto)
          .then(async (response) => {
            if (response.ok) {
              const roles = await response.json();
              setAvailableRoles(roles);
            } else {
              throw new Error();
            }
          });

        setFields({
          assignation: data.porcentaje,
          hours: data.horas,
          person: data.fk_persona,
          role: data.fk_rol,
          start_date: formatStandardNumberToStandardString(data.fecha_inicio),
        });
      })();
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
      Number(data.pk_recurso),
      Number(fields.assignation),
      Number(fields.hours),
      Number(fields.person),
      Number(data.fk_proyecto),
      Number(fields.role),
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

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Editar"}
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
        label="Rol"
        margin="dense"
        name="role"
        onChange={handleChange}
        required
        value={fields.role}
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
        inputProps={{
          max: 100,
          min: 1,
        }}
        label="% Asignación"
        margin="dense"
        name="assignation"
        onChange={handleChange}
        required
        type="number"
        value={fields.assignation}
      />
      <TextField
        fullWidth
        inputProps={{
          min: 1,
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

const useStyles = makeStyles((theme) => ({
  bar: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function Proyecto() {
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProyect, setSelectedProyect] = useState(null);
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_resource, setSelectedResource] = useState({});
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [table_should_update, setTableShouldUpdate] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [selected_tab, setSelectedTab] = useState(0);
  const classes = useStyles();

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const handleEditModalOpen = async (id) => {
    setSelectedResource(await getResource(id));
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => setTableShouldUpdate(true);

  const updateGantt = () => {
    getResourceGantt(selectedProyect).then((resources) => {
      const tasks = resources.map(({
        assignation,
        person,
        start_date,
        end_date,
      }, index) =>
        new Task({
          id: index,
          name: `${person} - ${assignation}%`,
          start: formatStandardNumberToStandardString(start_date),
          end: formatStandardNumberToStandardString(end_date),
          progress: 100,
        })
      );

      setTasks(tasks);
    });
  };

  useEffect(() => {
    getClients().then((clients) => {
      const entries = clients
        .map(({ pk_cliente, nombre }) => [pk_cliente, nombre])
        .sort((x, y) => (x[1]).localeCompare(y[1]));
      setParameters((prev_state) => ({ ...prev_state, clients: entries }));
    });
    getPeople().then((people) => {
      const entries = people
        .map(({ pk_persona, nombre }) => [pk_persona, nombre])
        .sort(([_x, x], [_y, y]) => x.localeCompare(y));
      setParameters((prev_state) => ({ ...prev_state, people: entries }));
    });
    getProjects().then((projects) => {
      const entries = projects
        .map((
          { pk_proyecto, nombre, fk_cliente },
        ) => [pk_proyecto, nombre, fk_cliente])
        .sort((x, y) => (x[1]).localeCompare(y[1]));
      setParameters((prev_state) => ({ ...prev_state, projects: entries }));
    });
  }, []);

  useEffect(() => {
    setSelectedProyect("");
  }, [selectedClient]);

  useEffect(() => {
    if (selectedProyect) {
      switch (selected_tab) {
        case 0:
          updateTable();
          break;
        case 1:
          updateGantt();
          break;
      }
    }
  }, [selectedProyect, selected_tab]);

  return (
    <Fragment>
      <Title title={"Planeación por proyecto"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          callback={updateTable}
          is_open={is_add_modal_open}
          project={selectedProyect}
          setModalOpen={setAddModalOpen}
        />
        <EditModal
          callback={updateTable}
          data={selected_resource}
          is_open={is_edit_modal_open}
          setModalOpen={setEditModalOpen}
        />
        <DeleteModal
          callback={updateTable}
          is_open={is_delete_modal_open}
          setModalOpen={setDeleteModalOpen}
          selected={selected}
        />
        <Grid container spacing={10}>
          <Grid item xs={6}>
            <AdvancedSelectField
              fullWidth
              label="Cliente"
              onChange={(_event, value) => setSelectedClient(value)}
              options={parameters.clients}
              required
              value={selectedClient}
            />
          </Grid>
          <Grid item xs={6}>
            <AdvancedSelectField
              disabled={!selectedClient}
              fullWidth
              label="Proyecto"
              onChange={(_event, value) => setSelectedProyect(value)}
              options={parameters.projects.filter(([_x, _y, client]) =>
                client == selectedClient
              )}
              required
              value={selectedProyect}
            />
          </Grid>
        </Grid>
      </ParameterContext.Provider>
      <br />
      {selectedProyect && (
        <div className={classes.bar}>
          <AppBar position="static">
            <Tabs
              value={selected_tab}
              onChange={(_e, tab) => handleTabChange(tab)}
              aria-label="simple tabs example"
            >
              <Tab label="Planeación" {...a11yProps(0)} />
              <Tab
                label="Gantt"
                {...a11yProps(1)}
                disabled={!selectedProyect}
              />
            </Tabs>
          </AppBar>
          <TabPanel value={selected_tab} index={0}>
            <Widget noBodyPadding>
              <AsyncTable
                columns={headers}
                onAddClick={() => setAddModalOpen(true)}
                onEditClick={(id) => handleEditModalOpen(id)}
                onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
                onTableUpdate={() => setTableShouldUpdate(false)}
                search={{
                  id_project: selectedProyect,
                }}
                update_table={table_should_update}
                url={"planeacion/recurso/table"}
              />
            </Widget>
          </TabPanel>
          <TabPanel
            index={1}
            value={selected_tab}
          >
            {tasks.length
              ? (
                <FrappeGantt
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
        </div>
      )}
    </Fragment>
  );
}
