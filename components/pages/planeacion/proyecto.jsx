import React, {
  Fragment,
  useEffect,
  useState
} from "react";
import {
  AppBar,
  Box,
  DialogContentText,
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
  requestGenerator,
} from "../../../lib/api/request.js";
import {
  parseDateToStandardNumber,
  parseStandardNumber,
} from "../../../lib/date/mod.js";

import AsyncSelectField from "../../common/AsyncSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const formatDateToInputDate = (date) => {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;

  return `${year}-${month}-${day}`;
};

const global_tasks = [
  {
    id: "Task 1",
    name: "William Morales",
    start: "2016-12-28",
    end: "2017-1-15",
    progress: 20,
  },
].map(x => new Task(x));

//TODO
//Fetch api functions should be global
const fetchClientApi = requestGenerator('clientes/cliente');
const fetchResourceApi = requestGenerator('planeacion/recurso');
const fetchPeopleApi = requestGenerator('organizacion/persona');
const fetchBudgetApi = requestGenerator('operaciones/presupuesto');
const fetchBudgetDetailApi = requestGenerator('operaciones/presupuesto_detalle');

const getClients = () => fetchClientApi().then((x) => x.json());
const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getBudget = () => fetchBudgetApi().then((x) => x.json());
const getBudgetDetails = (id) => fetchBudgetDetailApi(id).then((x) => x.json());
const getResource = (id) => fetchResourceApi(id).then((x) => x.json());
const getResources = () => fetchResourceApi().then((x) => x.json());

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
  { id: "person", numeric: false, disablePadding: false, label: "Recurso" },
  { id: "role", numeric: false, disablePadding: false, label: "Rol" },
  { id: "start_date", numeric: false, disablePadding: false, label: "Fecha Inicio" },
  { id: "end_date", numeric: false, disablePadding: false, label: "Fecha Fin" },
  { id: "hours", numeric: false, disablePadding: false, label: "Horas" },
  { id: "assignation", numeric: false, disablePadding: false, label: "Porcentaje" },
];

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
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AddModal = ({
  budget,
  callback,
  is_open,
  people,
  setModalOpen,
}) => {
  const [fields, setFields] = useState({
    person: '',
    budget: '',
    role: '',
    start_date: parseDateToStandardNumber(new Date()),
    assignation: '',
    hours: '',
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFields((prev_state) => {
      const data = ({ ...prev_state, [name]: value });
      return data;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    createResource(new URLSearchParams(fields))
      .then(async request => {
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
        person: '',
        budget: '',
        role: '',
        start_date: parseDateToStandardNumber(new Date()),
        assignation: '',
        hours: '',
      });
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
        label="Recurso"
        margin="dense"
        name="person"
        onChange={handleChange}
        required
        value={fields.person}
      >
        {people.map(({ pk_persona, nombre }) => (
          <option key={pk_persona} value={pk_persona}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Presupuesto"
        margin="dense"
        name="budget"
        onChange={handleChange}
        required
        value={fields.budget}
      >
        {budget.map(({ pk_presupuesto, nombre }) => (
          <option key={pk_presupuesto} value={pk_presupuesto}>{nombre}</option>
        ))}
      </SelectField>
      <AsyncSelectField
        disabled={!fields.budget}
        fullWidth
        handleSource={async (source) => {
          const available_roles = await getBudgetDetails(fields.budget)
            .then(details => details.reduce((res, { fk_rol }) => {
              res.push(fk_rol);
              return res;
            }, []));

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
        onChange={event => {
          const date = parseDateToStandardNumber(new Date(event.target.value));
          setFields((fields) => ({ ...fields, start_date: date }));
        }}
        required
        type="date"
        value={formatDateToInputDate(parseStandardNumber(fields.start_date) || new Date())}
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
  );
};

const EditModal = ({
  budget,
  callback,
  data,
  is_open,
  people,
  setModalOpen,
}) => {
  const [fields, setFields] = useState({
    person: '',
    budget: '',
    role: '',
    start_date: '',
    assignation: '',
    hours: '',
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
    }
  }, [is_open]);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFields((prev_state) => {
      const data = ({ ...prev_state, [name]: value });
      return data;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const id = data.pk_recurso;

    updateResource(id, new URLSearchParams(fields))
      .then(async request => {
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
      <SelectField
        fullWidth
        label="Recurso"
        margin="dense"
        name="person"
        onChange={handleChange}
        required
        value={fields.person}
      >
        {people.map(({ pk_persona, nombre }) => (
          <option key={pk_persona} value={pk_persona}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Presupuesto"
        margin="dense"
        name="budget"
        onChange={handleChange}
        required
        value={fields.budget}
      >
        {budget.map(({ pk_presupuesto, nombre }) => (
          <option key={pk_presupuesto} value={pk_presupuesto}>{nombre}</option>
        ))}
      </SelectField>
      <AsyncSelectField
        disabled={!fields.budget}
        fullWidth
        handleSource={async (source) => {
          const available_roles = await getBudgetDetails(fields.budget)
            .then(details => details.reduce((res, { fk_rol }) => {
              res.push(fk_rol);
              return res;
            }, []));

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
        onChange={event => {
          const date = parseDateToStandardNumber(new Date(event.target.value));
          setFields((fields) => ({ ...fields, start_date: date }));
        }}
        required
        type="date"
        value={formatDateToInputDate(parseStandardNumber(fields.start_date) || new Date())}
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
      .then((results) => results.reduce(async (total, result) => {
        if (result.status == 'rejected') {
          total.push(result.reason.message);
        } else if (!result.value.ok) {
          total.push(await formatResponseJson(result.value));
        }
        return total;
      }, []))
      .then(errors => {
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
        Esta operacion no se puede deshacer.
        ¿Esta seguro que desea eliminar estos <b>{selected.length}</b>
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

export default () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProyect, setSelectedProyect] = useState(null);
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_resource, setSelectedResource] = useState({});
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [dataShouldUpdate, setDataShouldUpdate] = useState(true);
  const [tasks, setTasks] = useState([]);

  const [people, setPeople] = useState([]);
  const [budget, setBudget] = useState([]);

  const [value, setValue] = React.useState(0);
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setDataShouldUpdate(true);
  };

  const handleEditModalOpen = async (id) => {
    setSelectedResource(await getResource(id));
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateData = () => {
    setDataShouldUpdate(true);
    getResources().then(resources => {
      const tasks = resources.map(({
        pk_recurso,
        horas,
        fecha_inicio,
        fecha_fin,
        porcentaje,
      }) => new Task({
        id: pk_recurso,
        name: horas,
        start: formatDateToInputDate(parseStandardNumber(fecha_inicio)),
        end: formatDateToInputDate(parseStandardNumber(fecha_fin)),
        progress: porcentaje,
      }));

      setTasks(tasks);
    });
  };

  useEffect(() => {
    getClients().then(clients => setClients(clients));
    getPeople().then(people => setPeople(people));
    getBudget().then(budget => setBudget(budget));
  }, []);

  return (
    <Fragment>
      <Title title={"Planeacion por Proyecto"} />
      <AddModal
        budget={budget}
        callback={updateData}
        is_open={is_add_modal_open}
        people={people}
        setModalOpen={setAddModalOpen}
      />
      <EditModal
        budget={budget}
        callback={updateData}
        data={selected_resource}
        is_open={is_edit_modal_open}
        people={people}
        setModalOpen={setEditModalOpen}
      />
      <DeleteModal
        is_open={is_delete_modal_open}
        setModalOpen={setDeleteModalOpen}
        selected={selected}
        callback={updateData}
      />
      <Grid container spacing={10}>
        <Grid item xs={6}>
          <SelectField
            fullWidth
            label="Cliente"
            onChange={event => setSelectedClient(event.target.value)}
            value={selectedClient}
          >
            {clients.map(({ pk_cliente, nombre }) => (
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
            onChange={event => setSelectedProyect(event.target.value)}
            source={`operaciones/proyecto/search?client=${selectedClient}`}
            value={selectedClient && selectedProyect}
          />
        </Grid>
      </Grid>
      <br />
      <div className={classes.bar}>
        <AppBar position="static">
          <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Planeacion" {...a11yProps(0)} />
            <Tab label="Gantt" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          <Widget noBodyPadding>
            <AsyncTable
              data_index={"NA"}
              data_source={"planeacion/recurso/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={dataShouldUpdate}
              setTableShouldUpdate={setDataShouldUpdate}
              title={"Recursos del Proyecto"}
            />
          </Widget>
        </TabPanel>
        <TabPanel
          index={1}
          value={value}
        >
          <FrappeGantt
            tasks={tasks.length ? tasks : global_tasks}
            viewMode={ViewMode.Week}
            onClick={task => console.log(task)}
            onDateChange={(task, start, end) => {
              console.log(task)
              const changed_task = tasks.filter(x => x.id === task.id)[0];
              changed_task.start = `2017-01-01`;
              changed_task.end = `2017-01-31`;
            }}
            onTasksChange={() => console.log('they changed')}
          />
        </TabPanel>
      </div>
    </Fragment>
  );
};
