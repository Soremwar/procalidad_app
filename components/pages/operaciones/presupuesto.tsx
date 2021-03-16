import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Button,
  DialogContentText,
  Grid,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request";
import {
  fetchBudgetApi,
  fetchBudgetTypeApi,
  fetchClientApi,
  fetchProjectApi,
  fetchRoleApi,
} from "../../../lib/api/generator.js";
import { Budget, BudgetDetail } from "../../../api/models/interfaces";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import ConfirmDialog from "../../common/ConfirmDialog.jsx";
import CurrencyField from "@unicef/material-ui-currency-textfield";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

const getBudgetTypes = () => fetchBudgetTypeApi<Array<{ nombre: string }>>();
const getClients = () => fetchClientApi<Array<{ nombre: string }>>();
const getProjects = () => fetchProjectApi<Array<{ nombre: string }>>();
const getRoles = () =>
  fetchRoleApi<Array<{ pk_rol: number; nombre: string }>>();

type BudgetDetailParameters = Omit<BudgetDetail, "budget">;

type BudgetParameters = {
  budget_type: string;
  client: string;
  description: string;
  direct_cost: string;
  name: string;
  productivity_percentage: string;
  project: string;
  roles: BudgetDetailParameters[];
  status: boolean;
  third_party_cost: string;
  unforeseen_cost: string;
};

const getBudget = (id: number) => fetchBudgetApi<Budget>(id);

const createBudget = (budget: BudgetParameters) =>
  fetchBudgetApi("", {
    method: "POST",
    body: JSON.stringify(budget),
    headers: {
      "Content-Type": "application/json",
    },
  });

const updateBudget = (
  id: number,
  budget: BudgetParameters,
  delete_open_items: boolean,
) =>
  fetchBudgetApi({
    path: id,
    params: {
      sobreescribir: delete_open_items,
    },
  }, {
    method: "PUT",
    body: JSON.stringify(budget),
    headers: {
      "Content-Type": "application/json",
    },
  });

const deleteBudget = async (id) => {
  return await fetchBudgetApi(id, {
    method: "DELETE",
  });
};

const headers = [
  {
    id: "project",
    numeric: false,
    disablePadding: false,
    label: "Proyecto",
    searchable: true,
  },
  {
    id: "budget_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de presupuesto",
    searchable: true,
  },
  {
    id: "client",
    numeric: false,
    disablePadding: false,
    label: "Cliente",
    searchable: true,
  },
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Nombre",
    searchable: true,
  },
  {
    id: "status",
    numeric: false,
    disablePadding: false,
    label: "Estado",
    searchable: true,
  },
];

const DEFAULT_PARAMETERS = {
  budget_types: [],
  clients: [],
  projects: [],
  roles: [],
};
const ParameterContext = createContext(DEFAULT_PARAMETERS);

const BudgetDetailRow = ({
  data,
  deleteBudgetDetail,
  roles,
  updateBudgetDetail,
}: {
  deleteBudgetDetail: (role: number) => void;
  data: BudgetDetailParameters;
  roles: Array<{ id: number; name: string }>;
  updateBudgetDetail: (prev_role: number, role: BudgetDetailParameters) => void;
}) => {
  const handleChange = (field: keyof BudgetDetail, value: unknown) => {
    const budget_detail = {
      ...data,
      [field]: value,
    };

    updateBudgetDetail(data.role, budget_detail);
  };

  return (
    <TableRow>
      <TableCell width="5%">
        <Button
          color="secondary"
          disabled={data.used}
          onClick={() => deleteBudgetDetail(data.role)}
          variant="contained"
        >
          -
        </Button>
      </TableCell>
      <TableCell width="35%">
        <SelectField
          blank_value={false}
          fullWidth
          onChange={(event) => handleChange("role", event.target.value)}
          required
          value={data.role}
        >
          {roles.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </SelectField>
      </TableCell>
      <TableCell width="20%">
        <TextField
          fullWidth
          inputProps={{
            min: 0,
            step: 0.5,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(event) => handleChange("hours", event.target.value)}
          required
          type="number"
          value={data.hours}
          variant="outlined"
        />
      </TableCell>
      <TableCell width="20%">
        <CurrencyField
          currencySymbol="$"
          decimalPlaces="0"
          fullWidth
          minimumValue="0"
          onChange={(_event, value) => handleChange("hour_cost", value)}
          outputFormat="number"
          required
          value={data.hour_cost}
          variant="outlined"
        />
      </TableCell>
      <TableCell width="20%">
        <CurrencyField
          currencySymbol="$"
          decimalPlaces="0"
          disabled
          fullWidth
          value={data.hours * data.hour_cost}
        />
      </TableCell>
    </TableRow>
  );
};

const BudgetDetailTable = ({
  budget_details,
  setBudgetDetails,
}: {
  budget_details: BudgetDetailParameters[];
  setBudgetDetails: (budget_details: BudgetDetailParameters[]) => void;
}) => {
  const {
    roles,
  } = useContext(ParameterContext);

  const used_roles = budget_details.map(({ role }) => Number(role));
  const available_roles = roles.filter(({ id }) =>
    !used_roles.includes(Number(id))
  );

  const addBudgetDetail = () => {
    // Set the first available role as the budget detail role
    // The budget detail role can't be empty
    const role = available_roles[0];

    const new_budget_detail: BudgetDetailParameters = {
      hour_cost: 0,
      hours: 0,
      role: role.id,
      used: false,
    };

    setBudgetDetails([...budget_details, new_budget_detail]);
  };

  // The previous role must be passed in case the role itself is what is being changed
  const updateBudgetDetail = (
    prev_role,
    budget_detail: BudgetDetailParameters,
  ) => {
    const item = budget_details.find(({ role }) =>
      Number(role) === Number(prev_role)
    );
    if (!item) return;

    Object.assign(item, budget_detail);

    setBudgetDetails(budget_details);
  };

  const deleteBudgetDetail = (role) => {
    setBudgetDetails(
      budget_details.filter((budget_detail) => budget_detail.role !== role),
    );
  };

  const distributeValue = (value) => {
    const time = budget_details.reduce(
      (sum, budget_detail) => (sum + Number(budget_detail.hours)),
      0,
    );
    const new_cost = time === 0 ? 0 : value / time;

    setBudgetDetails(budget_details.map((budget_detail) => {
      budget_detail.hour_cost = new_cost;
      return budget_detail;
    }));
  };

  return (
    <Fragment>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%">
                <Tooltip
                  placement="top"
                  title={!available_roles.length
                    ? "No hay mas roles disponibles para agregar"
                    : ""}
                >
                  <div>
                    <Button
                      color="primary"
                      disabled={!available_roles.length}
                      onClick={addBudgetDetail}
                      variant="contained"
                    >
                      +
                    </Button>
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell width="35%">Rol</TableCell>
              <TableCell width="20%">Horas</TableCell>
              <TableCell width="20%">Tarifa</TableCell>
              <TableCell width="20%">Valor venta recursos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budget_details.map((budget_detail) => (
              <BudgetDetailRow
                data={budget_detail}
                deleteBudgetDetail={deleteBudgetDetail}
                key={budget_detail.role}
                // The system won't allow you to use one role twice
                // So all used roles are excluded
                // Hence, you must append the current role to available roles
                roles={[
                  ...available_roles,
                  roles.find(({ id }) =>
                    Number(id) === Number(budget_detail.role)
                  ),
                ]}
                updateBudgetDetail={updateBudgetDetail}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ padding: "20px 0 0 0" }}>
        <Grid container spacing={1}>
          <Grid item md={4}>
            <TextField
              disabled
              fullWidth
              label="Total de horas"
              value={budget_details.reduce(
                (sum, { hours }) => (sum + Number(hours)),
                0,
              )}
            />
          </Grid>
          <Grid item md={4}>
            <CurrencyField
              currencySymbol="$"
              decimalPlaces="0"
              disabled
              fullWidth
              label="Valor total de venta"
              value={budget_details.reduce(
                (sum, { hour_cost, hours }) => (sum + (hour_cost * hours)),
                0,
              )}
            />
          </Grid>
          <Grid item md={4}>
            <CurrencyField
              currencySymbol="$"
              decimalPlaces="0"
              fullWidth
              label="Distribuir tarifas por valor de venta"
              minimumValue="0"
              onChange={(_event, value) => distributeValue(value)}
              outputFormat="number"
            />
          </Grid>
        </Grid>
      </div>
    </Fragment>
  );
};

const DEFAULT_FIELDS: BudgetParameters = {
  budget_type: "",
  client: "",
  description: "",
  direct_cost: "",
  name: "",
  productivity_percentage: "",
  project: "",
  roles: [],
  status: true,
  third_party_cost: "",
  unforeseen_cost: "",
};

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    budget_types,
    clients,
    projects,
  } = useContext(ParameterContext);

  const [error, setError] = useState(null);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const unique_roles = new Set(fields.roles.map(({ role }) => role)).size;
    if (unique_roles !== fields.roles.length) {
      setError("Los roles seleccionados no pueden repetirse");
      setLoading(false);
      return;
    }

    const request = await createBudget(fields);

    if (request.ok) {
      setModalOpen(false);
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (is_open) {
      setError(null);
      setFields(DEFAULT_FIELDS);
      setLoading(false);
    }
  }, [is_open]);

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      size="xl"
      title="Crear Nuevo"
    >
      <Grid container spacing={3}>
        <Grid item md={6}>
          <SelectField
            name="client"
            label="Cliente"
            fullWidth
            onChange={handleChange}
            required
            value={fields.client}
          >
            {clients.map(({ pk_cliente, nombre }) => (
              <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
            ))}
          </SelectField>
        </Grid>
        <Grid item md={6}>
          <SelectField
            disabled={!fields.client}
            name="project"
            label="Proyecto"
            fullWidth
            onChange={handleChange}
            required
            value={fields.project}
          >
            {projects
              .filter(({ fk_cliente }) => fk_cliente == fields.client)
              .map(({ pk_proyecto, nombre }) => (
                <option key={pk_proyecto} value={pk_proyecto}>{nombre}</option>
              ))}
          </SelectField>
        </Grid>
      </Grid>
      <SelectField
        name="budget_type"
        label="Tipo de presupuesto"
        fullWidth
        onChange={handleChange}
        required
        value={fields.budget_type}
      >
        {budget_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        name="name"
        label="Nombre"
        fullWidth
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        name="description"
        label="Descripción"
        fullWidth
        onChange={handleChange}
        required
        value={fields.description}
      />
      <SelectField
        fullWidth
        name="status"
        label="Estado"
        onChange={(event) => {
          const status = Boolean(Number(event.target.value));
          setFields((prev_state) => ({ ...prev_state, status }));
        }}
        required
        value={Number(fields.status)}
      >
        <option value="0">Cerrado</option>
        <option value="1">Abierto</option>
      </SelectField>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <CurrencyField
            currencySymbol="$"
            decimalPlaces="0"
            fullWidth
            label="Costo directo"
            minimumValue="0"
            onChange={(_event, direct_cost) =>
              setFields((prev_state) => ({ ...prev_state, direct_cost }))}
            outputFormat="number"
            required
            value={fields.direct_cost}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <CurrencyField
            currencySymbol="$"
            decimalPlaces="0"
            fullWidth
            label="Costo terceros"
            minimumValue="0"
            onChange={(_event, third_party_cost) =>
              setFields((prev_state) => ({ ...prev_state, third_party_cost }))}
            outputFormat="number"
            required
            value={fields.third_party_cost}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <CurrencyField
            currencySymbol="$"
            decimalPlaces="0"
            fullWidth
            label="Costo imprevisto"
            minimumValue="0"
            onChange={(_event, unforeseen_cost) =>
              setFields((prev_state) => ({ ...prev_state, unforeseen_cost }))}
            outputFormat="number"
            required
            value={fields.unforeseen_cost}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <CurrencyField
            currencySymbol="%"
            decimalPlaces="0"
            fullWidth
            label="Factor productividad"
            minimumValue="0"
            onChange={(_event, value) =>
              setFields((prev_state) => ({
                ...prev_state,
                productivity_percentage: value === "" ? "" : value / 100,
              }))}
            outputFormat="number"
            required
            value={fields.productivity_percentage === ""
              ? ""
              : fields.productivity_percentage * 100}
          />
        </Grid>
      </Grid>
      <br />
      <BudgetDetailTable
        budget_details={fields.roles}
        setBudgetDetails={(budget_details) => {
          setFields((prev_state) => ({ ...prev_state, roles: budget_details }));
        }}
      />
    </DialogForm>
  );
};

const DEFAULT_BUDGET_USE_COUNT = {
  assignation: 0,
  assignation_request: 0,
  planning: 0,
};

const EditModal = ({
  data,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    budget_types,
    clients,
    projects,
  } = useContext(ParameterContext);

  const [budget_use_count, setBudgetUseCount] = useState(
    DEFAULT_BUDGET_USE_COUNT,
  );
  const [budget_use_modal_open, setBudgetUseModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (is_open) {
      setError("");
      setLoading(false);
      setBudgetUseCount(DEFAULT_BUDGET_USE_COUNT);

      setFields({
        budget_type: data.fk_tipo_presupuesto,
        client: data.fk_cliente,
        description: data.descripcion,
        direct_cost: data.costo_directo,
        name: data.nombre,
        productivity_percentage: data.factor_productividad,
        project: String(data.fk_proyecto),
        roles: data.roles,
        status: data.estado,
        third_party_cost: data.costo_terceros,
        unforeseen_cost: data.costo_imprevisto,
      });
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async (delete_open_items = false) => {
    setLoading(true);
    setError(null);

    const unique_roles = new Set(data.roles.map(({ role }) => role)).size;
    if (unique_roles !== data.roles.length) {
      setError("Los roles seleccionados no pueden repetirse");
      setLoading(false);
      return;
    }

    const request = await updateBudget(
      data.pk_presupuesto,
      fields,
      delete_open_items,
    );

    const { code, message } = await request.json();

    if (request.ok) {
      if (request.status === 202) {
        if (code === "BUDGET_IN_USE") {
          setBudgetUseCount(message);
          setBudgetUseModalOpen(true);
        }
      } else {
        setModalOpen(false);
        updateTable();
      }
    } else {
      setError(message);
    }
    setLoading(false);
  };

  return (
    <Fragment>
      <DialogForm
        error={error}
        handleSubmit={() => handleSubmit()}
        is_loading={loading}
        is_open={is_open}
        setIsOpen={setModalOpen}
        size="xl"
        title="Editar"
      >
        <Grid container spacing={3}>
          <Grid item md={6}>
            <SelectField
              disabled
              name="client"
              label="Cliente"
              fullWidth
              onChange={handleChange}
              required
              value={fields.client}
            >
              {clients.map(({ pk_cliente, nombre }) => (
                <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
              ))}
            </SelectField>
          </Grid>
          <Grid item md={6}>
            <SelectField
              disabled
              name="project"
              label="Proyecto"
              fullWidth
              onChange={handleChange}
              required
              value={fields.project}
            >
              {projects
                .filter(({ fk_cliente }) => fk_cliente == fields.client)
                .map(({ pk_proyecto, nombre }) => (
                  <option key={pk_proyecto} value={pk_proyecto}>
                    {nombre}
                  </option>
                ))}
            </SelectField>
          </Grid>
        </Grid>
        <SelectField
          name="budget_type"
          label="Tipo de presupuesto"
          fullWidth
          onChange={handleChange}
          required
          value={fields.budget_type}
        >
          {budget_types.map(({ pk_tipo, nombre }) => (
            <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
          ))}
        </SelectField>
        <TextField
          name="name"
          label="Nombre"
          fullWidth
          onChange={handleChange}
          required
          value={fields.name}
        />
        <TextField
          name="description"
          label="Descripción"
          fullWidth
          onChange={handleChange}
          required
          value={fields.description}
        />
        <SelectField
          fullWidth
          name="status"
          label="Estado"
          onChange={(event) => {
            const status = Boolean(Number(event.target.value));
            setFields((prev_state) => ({ ...prev_state, status }));
          }}
          required
          value={Number(fields.status)}
        >
          <option value="0">Cerrado</option>
          <option value="1">Abierto</option>
        </SelectField>
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <CurrencyField
              currencySymbol="$"
              decimalPlaces="0"
              fullWidth
              label="Costo directo"
              minimumValue="0"
              onChange={(_event, direct_cost) =>
                setFields((prev_state) => ({ ...prev_state, direct_cost }))}
              outputFormat="number"
              required
              value={fields.direct_cost}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <CurrencyField
              currencySymbol="$"
              decimalPlaces="0"
              fullWidth
              label="Costo terceros"
              minimumValue="0"
              onChange={(_event, third_party_cost) =>
                setFields((prev_state) => ({
                  ...prev_state,
                  third_party_cost,
                }))}
              outputFormat="number"
              required
              value={fields.third_party_cost}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <CurrencyField
              currencySymbol="$"
              decimalPlaces="0"
              fullWidth
              label="Costo imprevisto"
              minimumValue="0"
              onChange={(_event, unforeseen_cost) =>
                setFields((prev_state) => ({ ...prev_state, unforeseen_cost }))}
              outputFormat="number"
              required
              value={fields.unforeseen_cost}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <CurrencyField
              currencySymbol="%"
              decimalPlaces="0"
              fullWidth
              label="Factor productividad"
              minimumValue="0"
              onChange={(_event, value) =>
                setFields((prev_state) => ({
                  ...prev_state,
                  productivity_percentage: value === "" ? "" : value / 100,
                }))}
              outputFormat="number"
              required
              value={fields.productivity_percentage === ""
                ? ""
                : fields.productivity_percentage * 100}
            />
          </Grid>
        </Grid>
        <br />
        <BudgetDetailTable
          budget_details={fields.roles}
          setBudgetDetails={(budget_details) => {
            setFields((prev_state) => ({
              ...prev_state,
              roles: budget_details,
            }));
          }}
        />
      </DialogForm>
      <ConfirmDialog
        onConfirm={() => handleSubmit(true)}
        onClose={() => setBudgetUseModalOpen(false)}
        open={budget_use_modal_open}
        title="Advertencia"
      >
        Actualmente los siguientes elementos estan usando este presupuesto.
        <br />
        <br />
        Planeaciones: {budget_use_count.planning}
        <br />
        Asignaciones activas: {budget_use_count.assignation}
        <br />
        Solicitudes de asignación: {budget_use_count.assignation_request}
        <br />
        <br />
        Al continuar, estos elementos seran eliminados. ¿Desea confirmar?
      </ConfirmDialog>
    </Fragment>
  );
};

const DeleteModal = ({
  is_open,
  selected,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteBudget(id));

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
        updateTable();
      });
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Crear Nuevo"}
      confirmButtonText="Confirmar"
    >
      <DialogContentText>
        Esta operacion no se puede deshacer. ¿Esta seguro que desea eliminar
        estos <b>{selected.length}</b>
        &nbsp;elementos?
      </DialogContentText>
    </DialogForm>
  );
};

export default function Presupuesto() {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [selected, setSelected] = useState([]);
  const [selected_budget, setSelectedBudget] = useState({});
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  useEffect(() => {
    let active = true;

    getBudgetTypes()
      .then(async (response) => {
        if (response.ok) {
          const budget_types = await response.json();
          if (!active) return;

          setParameters((prev_state) => ({
            ...prev_state,
            budget_types: budget_types.sort(({ nombre: x }, { nombre: y }) =>
              x.localeCompare(y)
            ),
          }));
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      })
      .catch((e) => console.log("Couldn't load the budget types", e));

    getClients()
      .then(async (response) => {
        if (response.ok) {
          const clients = await response.json();
          if (!active) return;

          setParameters((prev_state) => ({
            ...prev_state,
            clients: clients.sort(({ nombre: x }, { nombre: y }) =>
              x.localeCompare(y)
            ),
          }));
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      })
      .catch((e) => console.log("Couldn't load the clients", e));

    getProjects()
      .then(async (response) => {
        if (response.ok) {
          const projects = await response.json();
          if (!active) return;

          setParameters((prev_state) => ({
            ...prev_state,
            projects: projects.sort(({ nombre: x }, { nombre: y }) =>
              x.localeCompare(y)
            ),
          }));
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      })
      .catch((e) => console.log("Couldn't load the projects", e));

    getRoles()
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`Request failed with status ${response.status}`);
      })
      .then((raw_roles) => {
        const roles = raw_roles
          .map((role) => {
            return {
              id: role.pk_rol,
              name: role.nombre,
            };
          })
          .sort(({ name: x }, { name: y }) => x.localeCompare(y));

        if (!active) return;

        setParameters((prev_state) => ({
          ...prev_state,
          roles,
        }));
      })
      .catch((e) => console.log("Couldn't load the roles", e));

    updateTable();

    return () => {
      active = false;
    };
  }, []);

  const handleEditModalOpen = async (id: number) => {
    const data = await getBudget(id)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`Request failed with status "${response.status}"`);
      });

    setSelectedBudget(data);
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  return (
    <Fragment>
      <Title title="Presupuesto" />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_budget}
          is_open={is_edit_modal_open}
          setModalOpen={setEditModalOpen}
          updateTable={updateTable}
        />
      </ParameterContext.Provider>
      <DeleteModal
        is_open={is_delete_modal_open}
        setModalOpen={setDeleteModalOpen}
        selected={selected}
        updateTable={updateTable}
      />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget noBodyPadding>
            <AsyncTable
              columns={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              onTableUpdate={() => setTableShouldUpdate(false)}
              update_table={tableShouldUpdate}
              url="operaciones/presupuesto/table"
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
}