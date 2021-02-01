import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Checkbox,
  DialogContentText,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.ts";
import {
  fetchBudgetApi,
  fetchBudgetTypeApi,
  fetchClientApi,
  fetchProjectApi,
  fetchRoleApi,
} from "../../../lib/api/generator.js";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";
import CurrencyField from "@unicef/material-ui-currency-textfield";

/** @return Promise<Array<{nombre: string}>> */
const getClients = () => fetchClientApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getBudgetTypes = () => fetchBudgetTypeApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getProjects = () => fetchProjectApi().then((x) => x.json());
/** @return Promise<Array<{pk_rol: number, nombre: string}>> */
const getRoles = () => fetchRoleApi().then((x) => x.json());

const getBudget = (id) => fetchBudgetApi(id).then((x) => x.json());

const createBudget = async (form_data) => {
  return await fetchBudgetApi("", {
    method: "POST",
    body: JSON.stringify(form_data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const updateBudget = async (id, form_data) => {
  return await fetchBudgetApi(id, {
    method: "PUT",
    body: JSON.stringify(form_data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

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

const ParameterContext = createContext({
  budget_types: [],
  clients: [],
  projects: [],
});

const BudgetRole = ({
  id,
  index,
  time,
  price,
  used,
  roles,
  updateRole,
  deleteRole,
}) => {
  const [fields, setFields] = useState({
    role: id,
    time,
    price,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  useEffect(() => {
    setFields((prev_state) => ({ ...prev_state, price }));
  }, [price]);

  useEffect(() => {
    updateRole(index, fields.role, fields.time, fields.price);
  }, [fields]);

  return (
    <TableRow>
      <TableCell width="10%">
        <IconButton
          color="primary"
          disabled={used}
          onClick={(() => deleteRole(index))}
          variant="contained"
        >
          -
        </IconButton>
      </TableCell>
      <TableCell width="30%">
        <SelectField
          margin="dense"
          name="role"
          fullWidth
          onChange={handleChange}
          required
          value={fields.role}
        >
          {roles.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </SelectField>
      </TableCell>
      <TableCell width="15%">
        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            inputProps: {
              min: 0,
              step: 0.5,
            },
          }}
          name="time"
          onChange={handleChange}
          required
          type="number"
          value={fields.time}
          variant="outlined"
        />
      </TableCell>
      <TableCell width="25%">
        <CurrencyField
          currencySymbol="$"
          name="price"
          minimumValue="0"
          onChange={(_event, value) =>
            setFields((fields) => ({ ...fields, price: value }))}
          outputFormat="number"
          required
          value={fields.price}
          variant="outlined"
        />
      </TableCell>
      <TableCell width="20%">
        <CurrencyField
          currencySymbol="$"
          disabled
          value={fields.time * fields.price}
        />
      </TableCell>
    </TableRow>
  );
};

/**
 * @typedef Role
 * @type object
 * @property {number} id
 * @property {number} price
 * @property {number} time
 * @property {boolean} used
 * */

/**
 * @param {object} props
 * @param {Role[]} props.roles
 * */
const BudgetDetail = ({
  roles,
  setRoles,
}) => {
  const [available_roles, setAvailableRoles] = useState([]);
  const [distribute, setDistribute] = useState(false);

  useEffect(() => {
    getRoles()
      .then((roles) =>
        roles
          .map((role) => {
            return {
              id: role.pk_rol,
              name: role.nombre,
            };
          })
          .sort(({ name: x }, { name: y }) => x.localeCompare(y))
      )
      .then((roles) => setAvailableRoles(roles));
  }, []);

  const addRole = () => {
    if (!available_roles.length) return;
    const role = available_roles[0];
    const new_role = {
      id: role.id,
      name: role.name,
      time: 0,
      price: 0,
      used: false,
    };
    setRoles((prev_roles) => ([...prev_roles, new_role]));
  };

  //TODO
  //Change current detail interface to match the one returned by the API
  const updateRole = (key, id, time, price) => {
    setRoles((prev_roles) => {
      return prev_roles.map((role, index) => {
        if (index !== key) return role;
        role.id = id;
        role.time = Number(time);
        role.price = Number(price);
        return role;
      });
    });
  };

  const deleteRole = (key) => {
    setRoles((prev_roles) => prev_roles.filter((_, index) => index !== key));
  };

  const distributeValue = (value) => {
    const time = roles.reduce((sum, role) => (sum + Number(role.time)), 0);
    const price = time === 0 ? 0 : value / time;

    setRoles((prev_roles) =>
      prev_roles.map((role) => {
        role.price = price;
        return role;
      })
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="10%">
              <IconButton
                variant="contained"
                color="primary"
                onClick={addRole}
              >
                +
              </IconButton>
            </TableCell>
            <TableCell width="30%">Rol</TableCell>
            <TableCell width="15%">Horas</TableCell>
            <TableCell width="25%">Tarifa</TableCell>
            <TableCell width="20%">Total costo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role, index) => (
            <BudgetRole
              index={index}
              key={index}
              roles={available_roles}
              updateRole={updateRole}
              deleteRole={deleteRole}
              {...role}
            />
          ))}
        </TableBody>
      </Table>
      <Grid container style={{ padding: "10px" }}>
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>
            Total de horas: {roles.reduce(
              (sum, role) => (sum + Number(role.time)),
              0,
            )}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>
            Valor total: &nbsp; &nbsp;
            <CurrencyField
              currencySymbol="$"
              disabled
              value={roles.reduce(
                (sum, role) => (sum + (role.time * role.price)),
                0,
              )}
            />
          </Typography>
        </Grid>
        <Grid container>
          <Typography variant="h6" gutterBottom>
            <Checkbox
              checked={distribute}
              onChange={(event) => setDistribute(event.target.checked)}
            />
            Distribuir tarifas por valor &nbsp; &nbsp;
            <CurrencyField
              currencySymbol="$"
              disabled={!distribute}
              minimumValue="0"
              onChange={(_event, value) => distributeValue(value)}
              outputFormat="number"
              required
            />
          </Typography>
        </Grid>
      </Grid>
    </TableContainer>
  );
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

  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({
    client: "",
    project: "",
    budget_type: "",
    name: "",
    description: "",
    status: true,
  });
  const [roles, setRoles] = useState([]);

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

    const unique_roles = roles.reduce((count, x) => {
      if (!count.includes(x.id)) count.push(x.id);
      return count;
    }, []);

    if (unique_roles.length !== roles.length) {
      setError("Los roles seleccionados no pueden repetirse");
      setLoading(false);
      return;
    }

    const request = await createBudget({ ...fields, roles });

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
      setFields({
        client: "",
        project: "",
        budget_type: "",
        name: "",
        description: "",
        status: true,
      });
      setRoles([]);
      setLoading(false);
    }
  }, [is_open]);

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      size="md"
      title={"Crear Nuevo"}
    >
      <SelectField
        margin="dense"
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
      <SelectField
        margin="dense"
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
        margin="dense"
        name="name"
        label="Nombre"
        fullWidth
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
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
        margin="dense"
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
      <br />
      <br />
      <br />
      <BudgetDetail
        roles={roles}
        setRoles={setRoles}
      />
    </DialogForm>
  );
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

  const [fields, setFields] = useState({
    project: "",
    budget_type: "",
    name: "",
    description: "",
    status: false,
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (is_open) {
      setFields({
        client: data.fk_cliente,
        project: String(data.fk_proyecto),
        budget_type: data.fk_tipo_presupuesto,
        name: data.nombre,
        description: data.descripcion,
        status: data.estado,
      });
      setRoles(
        data.roles.map((
          { role, hours, hour_cost, used },
        ) => ({ id: role, time: hours, price: hour_cost, used })),
      );
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const unique_roles = roles.reduce((count, x) => {
      if (!count.includes(x.id)) count.push(x.id);
      return count;
    }, []);

    if (unique_roles.length !== roles.length) {
      setError("Los roles seleccionados no pueden repetirse");
      setLoading(false);
      return;
    }

    const request = await updateBudget(
      data.pk_presupuesto,
      { ...fields, roles },
    );

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
      size="md"
      title={"Editar"}
    >
      <SelectField
        disabled
        margin="dense"
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
            <option key={pk_proyecto} value={pk_proyecto}>{nombre}</option>
          ))}
      </SelectField>
      <SelectField
        margin="dense"
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
        margin="dense"
        name="name"
        label="Nombre"
        fullWidth
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
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
        margin="dense"
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
      <br />
      <br />
      <br />
      <BudgetDetail
        roles={roles}
        setRoles={setRoles}
      />
    </DialogForm>
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

export default () => {
  const [budget_types, setBudgetTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [parameters, setParameters] = useState({
    budget_types: [],
    clients: [],
    projects: [],
  });
  const [selected, setSelected] = useState([]);
  const [selected_budget, setSelectedBudget] = useState({});
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    const data = await getBudget(id);
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

  useEffect(() => {
    getBudgetTypes().then((budget_types) =>
      setParameters((prev_state) => ({
        ...prev_state,
        budget_types: budget_types.sort(({ nombre: x }, { nombre: y }) =>
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
    getProjects().then((projects) =>
      setParameters((prev_state) => ({
        ...prev_state,
        projects: projects.sort(({ nombre: x }, { nombre: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Presupuesto"} />
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
              url={"operaciones/presupuesto/table"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
