import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Snackbar,
  TextField,
} from "@material-ui/core";
import {
  Alert,
} from "@material-ui/lab";
import {
  fetchAssignationRequestApi,
  fetchClientApi,
  fetchProjectApi,
  fetchRoleApi,
  fetchWeekDetailApi,
} from "../../lib/api/generator.js";
import {
  UserContext,
} from "../context/User.jsx";
import {
  parseStandardNumber,
  parseDateToStandardNumber,
  formatStandardNumberToStandardString,
  formatStandardStringToStandardNumber,
} from "../../lib/date/mod.js";

import AdvancedSelectField from "../common/AdvancedSelectField.jsx";
import AsyncSelectField from "../common/AsyncSelectField.jsx";
import DialogForm from "../common/DialogForm.jsx";
import Title from "../common/Title.jsx";
import Table from "./registro/Table.jsx";

const getWeekDate = (id) => fetchWeekDetailApi(`semana/${id}`);

const getClients = () => fetchClientApi().then((x) => x.json());
const getProjects = () => fetchProjectApi().then((x) => x.json());

const getTableData = (id) =>
  fetchWeekDetailApi(`table/${id}`).then((x) => x.json());

const createWeekDetail = async (person, control, budget, role, hours) =>
  fetchWeekDetailApi(person, {
    body: JSON.stringify({ control, budget, role, hours }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateWeekDetail = async (id, control, budget, role, hours) =>
  fetchWeekDetailApi(id, {
    body: JSON.stringify({ control, budget, role, hours }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const closeWeek = async (person) =>
  fetchWeekDetailApi(`semana/${person}`, {
    method: "PUT",
  });

const createAssignationRequest = async (
  person,
  client,
  date,
  description,
  hours,
  project,
  role,
) =>
  fetchAssignationRequestApi(person, {
    body: JSON.stringify({
      client,
      date,
      description,
      hours,
      project,
      role,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const submitWeekDetail = async (
  person,
  { id, control_id, budget_id, role_id, used_hours },
) => {
  if (id) {
    return updateWeekDetail(id, control_id, budget_id, role_id, used_hours);
  } else {
    return createWeekDetail(person, control_id, budget_id, role_id, used_hours);
  }
};

const ParameterContext = createContext({
  clients: [],
  projects: [],
});

const AddModal = ({
  is_open,
  person_id,
  onSuccess,
  setModalOpen,
}) => {
  const {
    clients,
    projects,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    client: "",
    date: parseDateToStandardNumber(new Date()),
    description: "",
    hours: "",
    project: "",
    role: null,
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        client: "",
        date: parseDateToStandardNumber(new Date()),
        description: "",
        hours: "",
        project: "",
        role: null,
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  useEffect(() => {
    setFields((prev_state) => ({ ...prev_state, project: "" }));
  }, [fields.client]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const request = await createAssignationRequest(
      person_id,
      fields.client,
      fields.date,
      fields.description,
      fields.hours,
      fields.project,
      fields.role?.value,
    );

    if (request.ok) {
      setModalOpen(false);
      onSuccess();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Formato de solicitud de horas"}
    >
      <AdvancedSelectField
        label="Cliente"
        fullWidth
        name="client"
        onChange={(_e, value) =>
          setFields((prev_state) => ({ ...prev_state, client: value }))}
        options={clients}
        required
        value={fields.client}
      />
      <AdvancedSelectField
        disabled={!fields.client}
        label="Proyecto"
        fullWidth
        name="project"
        onChange={(_e, value) =>
          setFields((prev_state) => ({ ...prev_state, project: value }))}
        options={projects.filter(([_x, _y, client]) => client == fields.client)}
        required
        value={fields.project}
      />
      <AsyncSelectField
        disabled={!fields.project}
        fullWidth
        fetchOptions={async () => {
          const roles = await fetchRoleApi(`search?proyecto=${fields.project}`)
            .then(async (response) => {
              if (response.ok) {
                return await response.json();
              }
              throw new Error();
            });

          return roles.map(({
            pk_rol,
            nombre,
          }) => ({ text: nombre, value: pk_rol }));
        }}
        label="Rol"
        required
        setValue={(value) =>
          setFields((prev_state) => ({ ...prev_state, role: String(value) }))}
        value={fields.role}
      />
      <TextField
        fullWidth
        label="Horas"
        name="hours"
        onChange={(event) => {
          //Dont calculate event.target.value inside hook (asyncronous stuff)
          const value = event.target.value;
          setFields((prev_state) => ({
            ...prev_state,
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
        name="hours"
        onChange={handleChange}
        required
        type="number"
        value={fields.hours}
      />
      <TextField
        fullWidth
        InputProps={{
          inputProps: {
            maxLength: 255,
          },
        }}
        label="Descripcion"
        name="description"
        onChange={handleChange}
        required
        rows="2"
        value={fields.description}
      />
    </DialogForm>
  );
};

export default () => {
  const [context] = useContext(UserContext);

  const [alert_open, setAlertOpen] = useState(false);
  const [current_week, setCurrentWeek] = useState(null);
  const [error, setError] = useState(null);
  const [parameters, setParameters] = useState({
    clients: [],
    projects: [],
  });
  const [request_modal_open, setRequestModalOpen] = useState(false);
  const [table_data, setTableData] = useState(new Map());

  const updateCurrentWeek = () => {
    if (context.id) {
      getWeekDate(context.id)
        .then(async (response) => {
          if (response.ok) {
            const current_week = parseStandardNumber(await response.json());
            if (!current_week) throw new Error();
            setCurrentWeek(current_week);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          setAlertOpen(false);
          setError("No fue posible actualizar la fecha de registro");
          setAlertOpen(true);
        });
    }
  };

  //Set budget_id and role_id as unique key since id can be null
  const updateTable = () => {
    if (context.id) {
      getTableData(context.id)
        .then((data) => {
          setTableData((prev_state) => {
            return new Map(
              Array.from(prev_state).reduce(
                (total, [index, value]) => {
                  const match = total.findIndex(([index_t]) =>
                    index_t === index
                  );
                  if (match !== -1) {
                    if (
                      value.server_updated ||
                      total[match][1].used_hours == value.used_hours
                    ) {
                      total[match] = [index, { ...total[match][1] }];
                    } else {
                      total[match] = [
                        index,
                        {
                          ...total[match][1],
                          used_hours: value.used_hours,
                          server_updated: value.server_updated,
                        },
                      ];
                    }
                  }
                  return total;
                },
                data.map((
                  record,
                ) => [`${record.budget_id}_${record.role_id}`, record]),
              ),
            );
          });
        });
    }
  };

  const updateRow = (id, used_hours) => {
    const data = { ...table_data.get(id), used_hours, server_updated: false };
    setTableData((prev_state) => new Map([...prev_state, [id, data]]));
  };

  const handleRowSave = (row) => {
    if (Number(row.used_hours) >= 0) {
      submitWeekDetail(
        context.id,
        { ...row, used_hours: Number(row.used_hours) },
      )
        .then((response) => {
          setAlertOpen(false);
          if (!response.ok) {
            setError("No fue posible actualizar el registro");
          } else {
            setError(null);
          }
          setAlertOpen(true);
        })
        .finally(() => {
          updateTable();
        });
    } else {
      setError(`${row.used_hours} no es un numero valido`);
      setAlertOpen(true);
    }
  };

  const handleWeekSave = () => {
    const entries_not_saved = Array.from(table_data).some(([_i, value]) =>
      !value.server_updated
    );
    if (entries_not_saved) {
      setError("Guarde su tiempo antes de cerrar la semana");
      setAlertOpen(true);
    } else {
      closeWeek(context.id)
        .then(async (response) => {
          setAlertOpen(false);
          if (!response.ok) {
            const res = await response.json().then((body) => body.message);
            setError(res);
          } else {
            setError(null);
          }
          setAlertOpen(true);
        })
        .finally(() => {
          updateCurrentWeek();
          updateTable();
        });
    }
  };

  const handleAlertClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  useEffect(() => {
    updateCurrentWeek();
    getClients().then((clients) => {
      const entries = clients
        .map(({ pk_cliente, nombre }) => [pk_cliente, nombre])
        .sort((x, y) => x[1].localeCompare(y[1]));
      setParameters((prev_state) => ({ ...prev_state, clients: entries }));
    });
    getProjects().then((projects) => {
      const entries = projects
        .map((
          { pk_proyecto, nombre, fk_cliente },
        ) => [pk_proyecto, nombre, fk_cliente])
        .sort((x, y) => x[1].localeCompare(y[1]));
      setParameters((prev_state) => ({ ...prev_state, projects: entries }));
    });
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Registro"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={request_modal_open}
          person_id={context.id}
          onSuccess={() => {
            setError(false);
            setAlertOpen(true);
          }}
          setModalOpen={setRequestModalOpen}
        />
      </ParameterContext.Provider>
      <Table
        data={table_data}
        onButtonClick={() => setRequestModalOpen(true)}
        onRowSave={handleRowSave}
        onRowUpdate={updateRow}
        onWeekSave={handleWeekSave}
        week={current_week}
      />
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
