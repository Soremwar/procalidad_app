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
  Snackbar,
  TextField,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import {
  fetchAssignationRequestApi,
  fetchBudgetApi,
  fetchClientApi,
  fetchEarlyCloseRequestApi,
  fetchPeopleApi,
  fetchProjectApi,
  fetchRoleApi,
  fetchTimeApi,
  fetchWeekDetailApi,
} from "../../lib/api/generator.js";
import { UserContext } from "../context/User.jsx";
import {
  formatDateAsWeekLocal,
  formatStandardNumberToStandardString,
  formatStandardStringToStandardNumber,
  parseDateToStandardNumber,
} from "../../lib/date/mod.js";
import AdvancedSelectField from "../common/AdvancedSelectField.jsx";
import AsyncSelectField from "../common/AsyncSelectField.jsx";
import ConfirmDialog from "../common/ConfirmDialog.jsx";
import DateField from "../common/DateField.jsx";
import DialogForm from "../common/DialogForm.jsx";
import PlanningModal from "./registro/PlanningModal.jsx";
import SelectField from "../common/SelectField.jsx";
import Title from "../common/Title.jsx";
import Table, {
  reasonHasError,
  usedHoursHaveError,
} from "./registro/Table.jsx";
import { useMountReference } from "../common/hooks";

const getAvailableWeeks = (person) => fetchWeekDetailApi(`semanas/${person}`);
const getBlacklistedDates = (start_date, end_date) =>
  fetchTimeApi({
    path: "blacklist",
    params: {
      end_date,
      start_date,
    },
  });
const getClients = () => fetchClientApi().then((x) => x.json());
const getPeople = () => fetchPeopleApi();
const getProjects = () => fetchProjectApi();
const getProjectBudget = (project) =>
  fetchBudgetApi({
    params: {
      abierto: true,
      proyecto: project,
    },
  });
const getTableData = (person, week) => {
  let params = {};
  if (person && week) {
    params = {
      persona: person,
      semana: week,
    };
  }

  return fetchWeekDetailApi({ params }).then((x) => x.json());
};
const getWeekDetail = ({
  person,
  week,
} = {}) =>
  fetchWeekDetailApi({
    path: "detalle",
    params: { persona: person, semana: week },
  });

/**
 * This will send the filled registry and check for inconsistencies
 * @param {number=} person
 * @param {number=} week
 * */
const closeWeek = async (registry, person, week, overflow = false) => {
  return fetchWeekDetailApi("", {
    body: JSON.stringify({
      person,
      overflow,
      registry,
      week,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
};

const createAssignationRequest = async (
  person,
  sale_budget,
  {
    client,
    date,
    description,
    hours,
    project,
    role,
  },
) =>
  fetchAssignationRequestApi({
    params: {
      presupuesto_preventa: sale_budget,
    },
    path: person,
  }, {
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

const requestEarlyWeekClose = async (
  message,
) =>
  fetchEarlyCloseRequestApi("", {
    body: JSON.stringify({ message }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const DEFAULT_PARAMETERS = {
  available_weeks: [],
  clients: [],
  heatmap_blacklisted_dates: [],
  people: [],
  projects: [],
};

export const ParameterContext = createContext(DEFAULT_PARAMETERS);

const EarlyCloseDialog = ({
  onClose,
  onConfirm,
  open,
}) => {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      scroll="paper"
    >
      <DialogTitle>
        Solicitar cierre de semana
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Usted no cumple la cuota de horas mínimas para cerrar la semana
          <br />
          Sin embargo, es posible solicitar una excepción a su supervisor de
          área, ¿Desea enviar esta solicitud?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Solicitar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DEFAULT_FIELDS = {
  budget: "",
  client: "",
  date: "",
  description: "",
  hours: "",
  project: "",
  role: null,
};

const HourRequestModal = ({
  is_open,
  person_id,
  onSuccess,
  setModalOpen,
}) => {
  const {
    clients,
    projects,
  } = useContext(ParameterContext);

  const [error, setError] = useState(null);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [loading, setLoading] = useState(false);
  const [sale_budget_modal_open, setSaleBudgetModalOpen] = useState(false);

  const mounted = useMountReference();

  const setBudget = (budget) =>
    setFields((prev_state) => ({ ...prev_state, budget }));

  useEffect(() => {
    if (is_open) {
      setFields(DEFAULT_FIELDS);
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  useEffect(() => {
    setFields((prev_state) => ({ ...prev_state, project: "" }));
  }, [fields.client]);

  useEffect(() => {
    let active = true;

    if (fields.project) {
      getProjectBudget(fields.project)
        .then(async (response) => {
          if (response.ok) {
            const budgets = await response.json();

            if (!active) return;

            if (budgets.length) {
              setBudget(budgets[0].nombre);
            } else {
              setBudget();
            }
          } else {
            throw new Error();
          }
        })
        .catch((e) => console.error("Couldn't load the budget name", e));
    }

    return () => {
      active = false;
    };
  }, [fields.project]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async (
    sale_budget = false,
  ) => {
    setError("");
    setLoading(true);

    const request = await createAssignationRequest(
      person_id,
      sale_budget,
      {
        client: fields.client,
        date: fields.date,
        description: fields.description,
        hours: fields.hours,
        project: fields.project,
        role: fields.role?.value,
      },
    );

    const { code, message } = await request.json();

    if (!mounted.current) return;

    if (request.ok) {
      if (request.status === 202) {
        if (code === "ASSIGNATION_REQUEST_SALE_BUDGET") {
          setSaleBudgetModalOpen(true);
        }
      } else {
        setModalOpen(false);
        onSuccess();
      }
    } else {
      setError(message);
    }
    setLoading(false);
  };

  return (
    <Fragment>
      <DialogForm
        disabled={!fields.budget}
        error={error}
        handleSubmit={() => handleSubmit()}
        is_loading={loading}
        is_open={is_open}
        setIsOpen={setModalOpen}
        title="Formato de solicitud de horas"
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
        <SelectField
          disabled={!fields.client}
          error={fields.project && !fields.budget}
          label="Proyecto"
          fullWidth
          helperText={fields.project && !fields.budget
            ? "No hay presupuestos abiertos para este proyecto"
            : ""}
          name="project"
          onChange={handleChange}
          required
          value={fields.project}
        >
          {projects
            .filter(({ fk_cliente }) =>
              Number(fk_cliente) === Number(fields.client)
            )
            .map(({ pk_proyecto, nombre }) => (
              <option key={pk_proyecto} value={pk_proyecto}>{nombre}</option>
            ))}
        </SelectField>
        {!!(fields.project && fields.budget) && (
          <Fragment>
            <TextField
              disabled
              fullWidth
              label="Presupuesto"
              name="budget"
              required
              InputLabelProps={{
                shrink: true,
              }}
              value={fields.budget}
            />
            <AsyncSelectField
              fullWidth
              fetchOptions={async () => {
                const roles = await fetchRoleApi(
                  `search?proyecto=${fields.project}`,
                )
                  .then(async (response) => {
                    if (response.ok) {
                      return await response.json();
                    }
                    throw new Error();
                  });

                return roles.map(({
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
          </Fragment>
        )}
        <DateField
          fullWidth
          label="Fecha"
          name="date"
          onChange={(event) => {
            //Dont calculate event.target.value inside hook (asyncronous stuff)
            const date = formatStandardStringToStandardNumber(
              event.target.value,
            );
            setFields((prev_state) => ({
              ...prev_state,
              date,
            }));
          }}
          required
          value={formatStandardNumberToStandardString(fields.date)}
        />
        <TextField
          fullWidth
          inputProps={{
            min: 0.5,
            step: 0.5,
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
          label="Descripción"
          name="description"
          onChange={handleChange}
          required
          rows="2"
          value={fields.description}
        />
      </DialogForm>
      <ConfirmDialog
        onConfirm={() => handleSubmit(true)}
        onClose={() => setSaleBudgetModalOpen(false)}
        open={sale_budget_modal_open}
        title="Advertencia"
      >
        El proyecto seleccionado se encuentra en estado de preventa. Esta seguro
        que desea solicitar horas a este proyecto?
      </ConfirmDialog>
    </Fragment>
  );
};

const ConfirmRequestModal = ({
  closeModal,
  onConfirm,
  is_open,
}) => {
  return (
    <Dialog
      onClose={closeModal}
      open={is_open}
    >
      <DialogContent>
        Usted esta registrando sobre la semana actual
        <br />
        <br />
        Tenga en cuenta que su planeación será cargada aquí unicamente al
        finalizar la semana, así que no contar con datos es normal
        <br />
        <br />
        Consulte su planeación antes de solicitar asignación
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() => {
            closeModal();
            onConfirm();
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TODAY = parseDateToStandardNumber(new Date());
const MAX_DATE_HEATMAP = (() => {
  const date = new Date();
  date.setMonth(new Date().getMonth() + 2);
  return parseDateToStandardNumber(date);
})();

export default function Registro({
  admin_access = false,
}) {
  const [context] = useContext(UserContext);
  const mounted = useMountReference();

  const [alert_open, setAlertOpen] = useState(false);
  const [confirm_request_modal_open, setConfirmRequestModalOpen] = useState(
    false,
  );
  const [early_close_modal_open, setEarlyCloseModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [is_planning_modal_open, setPlanningModalOpen] = useState(false);
  const [overflow_week_modal_open, setOverflowWeekModalOpen] = useState(false);
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [request_modal_open, setRequestModalOpen] = useState(false);
  const [selected_person, setSelectedPerson] = useState(context.id);
  const [selected_week, setSelectedWeek] = useState("");
  const [table_data, setTableData] = useState(new Map());
  const [week_details, setWeekDetails] = useState({
    assignated_hours: 0,
    date: null,
    expected_hours: 0,
    id: null,
    requested_hours: 0,
  });

  /**
   * Admin mode will be disabled if the user is editing his own registry on the
   * current active week
   * Person and week selector will still be available, but the week close will work as
   * a regular user and assignation request and planning will be available
   * */
  //TODO
  //Disabled admin mode is too confusing, convert to admin mode
  const disable_admin_mode = !admin_access || (
    (Number(selected_person) === Number(context.id)) &&
    (Number(selected_week) === Number(week_details.id))
  );

  useEffect(() => {
    let active = true;

    getBlacklistedDates(
      TODAY,
      MAX_DATE_HEATMAP,
    )
      .then(async (response) => {
        if (response.ok) {
          const heatmap_blacklisted_dates = await response.json();

          if (active) {
            setParameters((prev_state) => ({
              ...prev_state,
              heatmap_blacklisted_dates,
            }));
          }
        } else {
          throw new Error();
        }
      })
      .catch(() =>
        console.error("Couldnt load the banned dates for the calendar")
      );
    getClients().then((clients) => {
      const entries = clients
        .map(({ pk_cliente, nombre }) => [pk_cliente, nombre])
        .sort((x, y) => x[1].localeCompare(y[1]));

      if (active) {
        setParameters((prev_state) => ({ ...prev_state, clients: entries }));
      }
    });
    getPeople()
      .then(async (response) => {
        if (response.ok) {
          /** @type Array<{nombre: string}>> */
          const people = await response.json();

          if (active) {
            setParameters((prev_state) => ({
              ...prev_state,
              people: people.sort(({ nombre: x }, { nombre: y }) =>
                x.localeCompare(y)
              ),
            }));
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Failed to load people"));
    getProjects()
      .then(async (response) => {
        if (response.ok) {
          const projects = (await response.json()).sort((
            { nombre: a },
            { nombre: b },
          ) => a.localeCompare(b));

          if (active) {
            setParameters((prev_state) => ({ ...prev_state, projects }));
          }
        } else {
          throw new Error();
        }
      })
      .catch((e) => console.error("Couldnt load projects", e));

    if (disable_admin_mode) {
      updateCurrentWeekDetails();
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setParameters((prev_state) => ({
      ...prev_state,
      available_weeks: [],
    }));

    if (!admin_access) {
      updateTable();
    }

    if (selected_person && admin_access) {
      getAvailableWeeks(selected_person)
        .then(async (response) => {
          if (response.ok) {
            /** @type Array<{code: string}> */
            const available_weeks = await response.json();

            if (active) {
              setParameters((prev_state) => ({
                ...prev_state,
                available_weeks: available_weeks.sort((
                  { code: x },
                  { code: y },
                ) => x.localeCompare(y)),
              }));
            }
          } else {
            throw new Error();
          }
        })
        .catch(() => console.error("Failed to load available weeks"));
    }

    return () => {
      active = false;
    };
  }, [selected_person]);

  useEffect(() => {
    if (selected_person && selected_week) {
      // TODO
      // Add unmount handling
      updateTable();
      updateCurrentWeekDetails();
    }
  }, [selected_person, selected_week]);

  const updateCurrentWeekDetails = () => {
    getWeekDetail({ person: selected_person, week: selected_week })
      .then(async (response) => {
        if (response.ok) {
          const week_details = await response.json();
          setWeekDetails(week_details);
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        if (!mounted.active) return;
        setAlertOpen(false);
        setError("No fue posible actualizar la fecha de registro");
        setAlertOpen(true);
      });
  };

  const updateTable = () => {
    let parameters = [];
    if (!disable_admin_mode) {
      //Don't fetch data if person and week haven't been selected
      if (!(selected_person && selected_week)) {
        return;
      }
      parameters = [
        selected_person,
        selected_week,
      ];
    }

    getTableData(...parameters)
      .then((data) => {
        setTableData(
          new Map(
            data.map(
              //Set budget_id and role_id as identifier
              (registry) => [`${registry.budget_id}_${registry.role_id}`, {
                ...registry,
                reason: "",
                previous_used_hours: registry.used_hours,
              }],
            ),
          ),
        );
      });
  };

  const updateHours = (id, used_hours) => {
    const data = { ...table_data.get(id), used_hours };
    setTableData(new Map(table_data.set(id, data)));
  };

  const updateReason = (id, reason) => {
    const data = { ...table_data.get(id), reason };
    setTableData(new Map(table_data.set(id, data)));
  };

  const handleEarlyCloseRequested = (message) => {
    setAlertOpen(false);
    setError(null);

    requestEarlyWeekClose(message)
      .then(async (response) => {
        if (!response.ok) {
          const res = await response
            .json()
            .then((body) => body.message);
          setError(res);
        }
      })
      .catch(() => {
        console.error("couldnt complete the early close request");
        setError("Ocurrio un error al enviar la solicitud");
      })
      .finally(() => setAlertOpen(true));
  };

  const handleWeekSave = (overflow) => {
    const registry = Array.from(table_data.values()).map((
      { budget_id, reason, role_id, used_hours },
    ) => ({
      budget: budget_id,
      hours: used_hours,
      role: role_id,
      reason,
    }));
    let params;
    if (disable_admin_mode) {
      params = [registry, undefined, undefined, overflow];
    } else {
      params = [
        registry,
        Number(selected_person),
        Number(selected_week),
        overflow,
      ];
    }
    closeWeek(...params)
      .then(async (response) => {
        setAlertOpen(false);

        const {
          code,
          message,
        } = await response.json();

        if (response.ok) {
          if (response.status === 202) {
            setOverflowWeekModalOpen(true);
          } else {
            setError(null);
            setAlertOpen(true);
            updateCurrentWeekDetails();
            if (disable_admin_mode) {
              updateTable();
            }
          }
        } else {
          //You can't close the week early on edit mode
          //Early close is only available for open weeks
          if (disable_admin_mode) {
            if (code === "REGISTRY_WEEK_NOT_COMPLETED") {
              setEarlyCloseModalOpen(true);
              return;
            }
          }
          setError(message);
          setAlertOpen(true);
        }
      });
  };

  const handleAlertClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  return (
    <Fragment>
      <Title title="Registro" />
      {admin_access
        ? (<Grid container spacing={3}>
          <Grid item md={6}>
            <SelectField
              blank_value={false}
              label="Persona"
              fullWidth
              onChange={(event) => setSelectedPerson(event.target.value)}
              shrink={true}
              value={selected_person}
            >
              {parameters.people.map(({ pk_persona, nombre }) => (
                <option key={pk_persona} value={pk_persona}>{nombre}</option>
              ))}
            </SelectField>
          </Grid>
          <Grid item md={6}>
            <SelectField
              disabled={!selected_person}
              label="Semana"
              fullWidth
              onChange={(event) => setSelectedWeek(event.target.value)}
              shrink={true}
              value={selected_week}
            >
              {parameters.available_weeks.map(({ id, start_date }, index) => (
                <option key={id} value={id}>
                  {(() => {
                    const parsed_date = new Date(start_date);
                    let week = formatDateAsWeekLocal(
                      new Date(
                        parsed_date.getTime() +
                          (parsed_date.getTimezoneOffset() * 60 * 1000),
                      ),
                    );

                    if (index === parameters.available_weeks.length - 1) {
                      week += " (Semana actual)";
                    }

                    return week;
                  })()}
                </option>
              ))}
            </SelectField>
          </Grid>
        </Grid>)
        : null}
      <ParameterContext.Provider value={parameters}>
        <br />
        <HourRequestModal
          is_open={request_modal_open}
          person_id={context.id}
          onSuccess={() => {
            setAlertOpen(true);
            setError(false);
            updateCurrentWeekDetails();
          }}
          setModalOpen={setRequestModalOpen}
        />
      </ParameterContext.Provider>
      {(disable_admin_mode || (selected_person && selected_week)) && (
        <Table
          data={table_data}
          edit_mode={!disable_admin_mode}
          header={disable_admin_mode && (
            <Button
              onClick={() => {
                if (week_details.is_current_week === false) {
                  setRequestModalOpen(true);
                } else if (week_details.is_current_week) {
                  setConfirmRequestModalOpen(true);
                }
              }}
              variant="contained"
            >
              Solicitar horas
            </Button>
          )}
          footer={<Grid container style={{ textAlign: "center" }}>
            <Grid item md={6} xs={12}>
              <Button
                // Disable if reasons are not filled out in admin mode or or hours are not valid
                disabled={Array.from(table_data).some(([_index, {
                  expected_hours,
                  previous_used_hours,
                  reason,
                  used_hours,
                }]) =>
                  // Check only if admin mode is enabled
                  (!disable_admin_mode &&
                    reasonHasError(reason, used_hours, previous_used_hours)) ||
                  usedHoursHaveError(used_hours, expected_hours)
                )}
                onClick={() => handleWeekSave(false)}
                variant="contained"
              >
                {disable_admin_mode ? "Cerrar Semana" : "Modificar semana"}
              </Button>
            </Grid>
            <Grid item md={6} xs={12}>
              {disable_admin_mode && (
                <Button
                  onClick={() => setPlanningModalOpen(true)}
                  variant="contained"
                >
                  Visualizar planeación
                </Button>
              )}
            </Grid>
          </Grid>}
          onHourChange={updateHours}
          onReasonChange={updateReason}
          week_details={week_details}
        />
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
      <ParameterContext.Provider value={parameters}>
        <PlanningModal
          closeModal={() => setPlanningModalOpen(false)}
          end_date={MAX_DATE_HEATMAP}
          is_open={is_planning_modal_open}
          start_date={TODAY}
        />
      </ParameterContext.Provider>
      <ConfirmRequestModal
        closeModal={() => setConfirmRequestModalOpen(false)}
        onConfirm={() => setRequestModalOpen(true)}
        is_open={confirm_request_modal_open}
      />
      <EarlyCloseDialog
        onClose={() => setEarlyCloseModalOpen(false)}
        onConfirm={(message) => handleEarlyCloseRequested(message)}
        open={early_close_modal_open}
      />
      <ConfirmDialog
        onConfirm={() => handleWeekSave(true)}
        onClose={() => setOverflowWeekModalOpen(false)}
        open={overflow_week_modal_open}
        title="Asignación excedida"
      >
        Usted va a cerrar la semana con más horas de las laborales de la semana,
        por favor revise que su registro sea correcto.
        <br />
        Recuerde que las horas adicionales solo tendran reconocimiento económico
        si fueron aprobadas <b>previamente</b>
      </ConfirmDialog>
    </Fragment>
  );
}
