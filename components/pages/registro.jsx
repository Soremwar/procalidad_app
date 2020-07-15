import React, {
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
  fetchClientApi,
  fetchProjectApi,
  fetchWeekDetailApi,
} from "../../lib/api/generator.js";
import {
  UserContext,
} from "../context/User.jsx";
import {
  parseStandardNumber,
} from "../../lib/date/mod.js";

import DialogForm from "../common/DialogForm.jsx";
import SelectField from "../common/SelectField.jsx";
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

const AddModal = ({
  clients,
  is_open,
  projects,
  setModalOpen,
}) => {
  const [fields, setFields] = useState({
    client: "",
    project: "",
    hours: "",
    description: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        client: "",
        project: "",
        hours: "",
        description: "",
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createArea(new URLSearchParams(fields));

    if (request.ok) {
      setModalOpen(false);
      updateTable();
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
      <SelectField
        label="Cliente"
        fullWidth
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
        label="Proyecto"
        fullWidth
        name="project"
        onChange={handleChange}
        required
        value={fields.project}
      >
        {projects.map(({ pk_proyecto, nombre }) => (
          <option key={pk_proyecto} value={pk_proyecto}>{nombre}</option>
        ))}
      </SelectField>
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
      setAlertOpen(false);
      setError(null);
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
    setAlertOpen(false);
    setError(false);
    if (Number(row.used_hours)) {
      submitWeekDetail(context.id, row)
        .then((response) => {
          if (!response.ok) {
            setError("No fue posible actualizar el registro");
          }
        })
        .finally(() => {
          setAlertOpen(true);
          updateTable();
        });
    } else {
      setError(`${row.used_hours} no es un numero valido`);
      setAlertOpen(true);
    }
  };

  const handleWeekSave = () => {
    setAlertOpen(false);
    setError(null);
    const entries_not_saved = Array.from(table_data).some(([_i, value]) =>
      !value.server_updated
    );
    if (entries_not_saved) {
      setError("Guarde su tiempo antes de cerrar la semana");
      setAlertOpen(true);
    } else {
      closeWeek(context.id)
        .then(async (response) => {
          if (!response.ok) {
            setError(await response.json().then((body) => body.message));
            setAlertOpen(true);
          }
        }).finally(() => {
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
    getClients().then((clients) =>
      setParameters((prev_state) => ({ ...prev_state, clients }))
    );
    getProjects().then((projects) =>
      setParameters((prev_state) => ({ ...prev_state, projects }))
    );
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Registro"} />
      <AddModal
        clients={parameters.clients}
        is_open={request_modal_open}
        projects={parameters.projects}
        setModalOpen={setRequestModalOpen}
      />
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
