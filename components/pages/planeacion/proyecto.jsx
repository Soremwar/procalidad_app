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
  fetchClientApi,
  fetchBudgetApi,
  fetchBudgetDetailApi,
  fetchPeopleApi,
  fetchResourceApi,
} from "../../../lib/api/generator.js";

import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncSelectField from "../../common/AsyncSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

const getBudgets = () => fetchBudgetApi().then((x) => x.json());
const getBudgetDetails = (id) => fetchBudgetDetailApi(id).then((x) => x.json());
const getClients = () => fetchClientApi().then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getResource = (id) => fetchResourceApi(id).then((x) => x.json());
const getResourceGantt = (project) => {
  const params = new URLSearchParams(Object.fromEntries([
    ["project", project],
    ["type", "project"],
  ].filter(([_index, value]) => value)));
  return fetchResourceApi(`gantt?${params.toString()}`).then((x) => x.json());
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
  {
    id: "assignation",
    numeric: false,
    disablePadding: false,
    label: "Porcentaje",
    searchable: true,
  },
];

const ParameterContext = createContext({
  budgets: [],
  clients: [],
  people: [],
});

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
    budgets,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    person: "",
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

    createResource(new URLSearchParams(fields))
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
    start_date: "",
    assignation: "",
    hours: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        person: data.fk_persona,
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

    updateResource(data.pk_recurso, new URLSearchParams(fields))
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
      {project
        ? (
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
              label="Presupuesto"
              margin="dense"
              name="budget"
              onChange={handleChange}
              required
              value={fields.budget}
            >
              {budgets.map(({ pk_presupuesto, nombre }) => (
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
          <NotSelectedProjectDialog
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
  project,
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
      {project
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
          <NotSelectedProjectDialog
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

export default () => {
  const [parameters, setParameters] = useState({
    budgets: [],
    clients: [],
    people: [],
  });
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
      <Title title={"Planeacion por Proyecto"} />
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
          project={selectedProyect}
          setModalOpen={setEditModalOpen}
        />
        <DeleteModal
          callback={updateTable}
          is_open={is_delete_modal_open}
          project={selectedProyect}
          setModalOpen={setDeleteModalOpen}
          selected={selected}
        />
        <Grid container spacing={10}>
          <Grid item xs={6}>
            <SelectField
              fullWidth
              label="Cliente"
              onChange={(event) => setSelectedClient(event.target.value)}
              value={selectedClient}
            >
              {parameters.clients.map(({ pk_cliente, nombre }) => (
                <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
              ))}
            </SelectField>
          </Grid>
          <Grid item xs={6}>
            <AsyncSelectField
              disabled={!selectedClient}
              fullWidth
              handleSource={async (source) => {
                return Object.values(source)
                  .map(({
                    pk_proyecto,
                    nombre,
                  }) => {
                    return { value: String(pk_proyecto), text: nombre };
                  });
              }}
              label="Proyecto"
              onChange={(event) => setSelectedProyect(event.target.value)}
              source={`operaciones/proyecto/search?client=${selectedClient}`}
              value={selectedClient && selectedProyect}
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
              <Tab label="Planeacion" {...a11yProps(0)} />
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
                <Typography>
                  No existen datos para mostrar
                </Typography>
              )}
          </TabPanel>
        </div>
      )}
    </Fragment>
  );
};
