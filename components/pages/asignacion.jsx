import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  TextField,
} from "@material-ui/core";
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
} from "../../lib/api/generator.js";

import AdvancedSelectField from "../common/AdvancedSelectField.jsx";
import AsyncSelectField from "../common/AsyncSelectField.jsx";
import AsyncTable from "../common/AsyncTable/Table.jsx";
import DialogForm from "../common/DialogForm.jsx";
import Title from "../common/Title.jsx";
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

export default () => {
  const [userState] = useContext(UserContext);
  const [parameters, setParameters] = useState({
    budgets: [],
    clients: [],
    people: [],
    projects: [],
    weeks: [],
  });
  const [selected_client, setSelectedClient] = useState("");
  const [selected_project, setSelectedProject] = useState("");
  const [selected_week, setSelectedWeek] = useState("");
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_resource, setSelectedResource] = useState({});
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [dataShouldUpdate, setDataShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedResource(await getAssignation(id));
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    if (selected_project && selected_week) {
      setDataShouldUpdate(true);
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
    updateTable();
  }, [selected_project, selected_week]);

  return (
    <Fragment>
      <Title title={"Asignacion"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          callback={updateTable}
          is_open={is_add_modal_open}
          project={selected_project}
          setModalOpen={setAddModalOpen}
        />
        <EditModal
          callback={updateTable}
          data={selected_resource}
          is_open={is_edit_modal_open}
          project={selected_project}
          setModalOpen={setEditModalOpen}
        />
        <DeleteModal
          is_open={is_delete_modal_open}
          project={selected_project}
          setModalOpen={setDeleteModalOpen}
          selected={selected}
          callback={updateTable}
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
                .map((week) => (
                  <option key={week} value={week}>
                    {parseNumberAsWeek(week)}
                  </option>
                ))}
            </SelectField>
          </Grid>
        </Grid>
      </ParameterContext.Provider>
      <br />
      {selected_project && selected_week && (
        <AsyncTable
          columns={headers}
          onAddClick={() => setAddModalOpen(true)}
          onEditClick={(id) => handleEditModalOpen(id)}
          onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
          onTableUpdate={() => setDataShouldUpdate(false)}
          search={{
            id_project: selected_project,
            week_date: selected_week,
          }}
          update_table={dataShouldUpdate}
          url={"asignacion/asignacion/table"}
        />
      )}
    </Fragment>
  );
};
