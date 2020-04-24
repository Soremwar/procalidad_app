import React, {
  Fragment,
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
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";

import { requestGenerator } from "../../../lib/api/request.js";

import AsyncSelectField from "../../common/AsyncSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const fetchRoleApi = requestGenerator('operaciones/rol');
const fetchClientApi = requestGenerator('clientes/cliente');
const fetchBudgetTypeApi = requestGenerator('operaciones/tipo_presupuesto');
const fetchBudgetApi = requestGenerator('operaciones/presupuesto');

const getRoles = () => fetchRoleApi().then((x) => x.json());

const getClients = () => fetchClientApi().then((x) => x.json());

const getBudgetTypes = () => fetchBudgetTypeApi().then((x) => x.json());

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
  { id: "project", numeric: false, disablePadding: false, label: "Proyecto" },
  {
    id: "budget_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de Proyecto",
  },
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "status", numeric: false, disablePadding: false, label: "Estado" },
];

const BudgetRole = ({
  id,
  index,
  time,
  price,
  roles,
  updateRole,
  deleteRole,
}) => {
  const [fields, setFields] = useState({
    id,
    time,
    price,
  });

  const handleChange = (event) => {
    if (!event.target.checkValidity()) return;
    const name = event.target.name;
    const value = Number(event.target.value);
    setFields((prev_state) => {
      const data = ({ ...prev_state, [name]: value });
      return data;
    });
  };

  useEffect(() => {
    setFields((prev_state) => ({ ...prev_state, price }));
  }, [price]);

  useEffect(() => {
    updateRole(index, fields.id, fields.time, fields.price);
  }, [fields]);

  return (
    <TableRow>
      <TableCell width="10%">
        <IconButton
          color="primary"
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
          onChange={(event) => handleChange(event)}
          required
          value={fields.id}
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
          name="time"
          onChange={(event) => handleChange(event)}
          required
          type="number"
          value={fields.time}
          variant="outlined"
        />
      </TableCell>
      <TableCell width="25%">
        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          name="price"
          onChange={(event) => handleChange(event)}
          required
          type="number"
          value={fields.price}
          variant="outlined"
        />
      </TableCell>
      <TableCell width="20%">{`$ ${fields.time * fields.price}`}</TableCell>
    </TableRow>
  );
};

const BudgetDetail = ({
  roles,
  setRoles,
}) => {
  const [available_roles, setAvailableRoles] = useState([]);
  const [distribute, setDistribute] = useState(false);

  useEffect(() => {
    getRoles()
      .then((roles) =>
        roles.map((role) => {
          return {
            id: role.pk_rol,
            name: role.nombre,
          };
        })
      )
      .then((roles) => setAvailableRoles(roles));
  }, []);

  const addRole = () => {
    if (!available_roles.length) return;
    const role = available_roles[0];
    const new_role = { id: role.id, name: role.name, time: 0, price: 0 };
    setRoles((prev_roles) => ([...prev_roles, new_role]));
  };

  const updateRole = (key, id, time, price) => {
    setRoles((prev_roles) => (
      prev_roles.map((role, index) => {
        if (index !== key) return role;
        role.id = id;
        role.time = time;
        role.price = price;
        return role;
      })
    ));
  };

  const deleteRole = (key) => {
    setRoles((prev_roles) => prev_roles.filter((_, index) => index !== key));
  };

  const distributeValue = (event) => {
    if (!event.target.checkValidity()) return;
    const time = roles.reduce((sum, role) => (sum + role.time), 0);
    const value = Number(event.target.value);
    const price = value / time;

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
            <TableCell width="20%">Total Costo</TableCell>
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
            Total de Horas: {roles.reduce((sum, role) => (sum + role.time), 0)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>
            Valor Total: $ {roles.reduce(
            (sum, role) => (sum + (role.time * role.price)),
            0,
          )}
          </Typography>
        </Grid>
        <Grid container>
          <Typography variant="h6" gutterBottom>
            <Checkbox
              checked={distribute}
              onChange={(event) => setDistribute(event.target.checked)}
            />
            Distribuir tarifas por valor
            <TextField
              disabled={!distribute}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(event) => distributeValue(event)}
              type="number"
              variant="outlined"
            />
          </Typography>
        </Grid>
      </Grid>
    </TableContainer>
  );
};

const AddModal = ({
  budget_types,
  clients,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({
    client: "",
    project: "",
    budget_type: "",
    name: "",
    description: "",
    status: "",
  });
  const [project_query, setProjectQuery] = useState("");
  const [roles, setRoles] = useState([]);

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
        status: "",
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
        onChange={(event) => handleChange(event)}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <AsyncSelectField
        disabled={!fields.client}
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_proyecto,
            nombre,
          }) => {
            return { value: String(pk_proyecto), text: nombre };
          })
        )}
        label="Proyecto"
        margin="dense"
        name="project"
        onChange={(event) => handleChange(event)}
        onType={(event) => {
          if (fields.project) {
            setFields((old_state) => ({ ...old_state, project: "" }));
          }
          const value = event.target.value;
          setProjectQuery(value);
        }}
        required
        source={`operaciones/proyecto/search?client=${fields.client}&query=${encodeURI(
          fields.project
            ? ""
            : project_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.project}
      />
      <SelectField
        margin="dense"
        name="budget_type"
        label="Tipo de Presupuesto"
        fullWidth
        onChange={(event) => handleChange(event)}
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
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
        name="description"
        label="Descripcion"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.description}
      />
      <SelectField
        margin="dense"
        name="status"
        label="Estado"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.status}
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
  budget_types,
  clients,
  data,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    project: "",
    budget_type: "",
    name: "",
    description: "",
    status: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [project_query, setProjectQuery] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (is_open) {
      setFields({
        client: data.fk_cliente,
        project: String(data.fk_proyecto),
        budget_type: data.fk_tipo_presupuesto,
        name: data.nombre,
        description: data.descripcion,
        status: Number(data.estado),
      });
      setRoles(
        data.roles.map((
          { fk_rol, horas, tarifa_hora },
        ) => ({ id: fk_rol, time: horas, price: tarifa_hora })),
      );
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

    const unique_roles = roles.reduce((count, x) => {
      if (!count.includes(x.id)) count.push(x.id);
      return count;
    }, []);

    if (unique_roles.length !== roles.length) {
      setError("Los roles seleccionados no pueden repetirse");
      setLoading(false);
      return;
    }

    const id = data.pk_presupuesto;
    const request = await updateBudget(id, { ...fields, roles });

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
        margin="dense"
        name="client"
        label="Cliente"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <AsyncSelectField
        disabled={!fields.client}
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_proyecto,
            nombre,
          }) => {
            return { value: String(pk_proyecto), text: nombre };
          })
        )}
        label="Proyecto"
        margin="dense"
        name="project"
        onChange={(event) => handleChange(event)}
        onType={(event) => {
          if (fields.project) {
            setFields((old_state) => ({ ...old_state, project: "" }));
          }
          const value = event.target.value;
          setProjectQuery(value);
        }}
        preload
        required
        source={`operaciones/proyecto/search?client=${fields.client}&query=${encodeURI(
          fields.project
            ? ""
            : project_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.project}
      />
      <SelectField
        margin="dense"
        name="budget_type"
        label="Tipo de Presupuesto"
        fullWidth
        onChange={(event) => handleChange(event)}
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
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
        name="description"
        label="Descripcion"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.description}
      />
      <SelectField
        margin="dense"
        name="status"
        label="Estado"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.status}
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

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteBudget(id));

    //TODO
    //Add error catching
    Promise.all(delete_progress)
      .then(() => {
        setModalOpen(false);
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
        Esta operacion no se puede deshacer.
        ¿Esta seguro que desea eliminar estos <b>{selected.length}</b>
        &nbsp;elementos?
      </DialogContentText>
    </DialogForm>
  );
};

export default () => {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_budget, setSelectedBudget] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);
  const [clients, setClients] = useState([]);
  const [budget_types, setBudgetTypes] = useState([]);

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
    getClients().then((clients) => setClients(clients));
    getBudgetTypes().then((budget_types) => setBudgetTypes(budget_types));
  }, []);

  return (
    <Fragment>
      <Title title={"Presupuesto"} />
      <AddModal
        budget_types={budget_types}
        clients={clients}
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        budget_types={budget_types}
        clients={clients}
        data={selected_budget}
        is_open={is_edit_modal_open}
        setModalOpen={setEditModalOpen}
        updateTable={updateTable}
      />
      <DeleteModal
        is_open={is_delete_modal_open}
        setModalOpen={setDeleteModalOpen}
        selected={selected}
        updateTable={updateTable}
      />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget noBodyPadding>
            {/*
              TODO
              Remove hardcoded url
            */}
            <AsyncTable
              data_index={"pk_presupuesto"}
              data_source={"operaciones/presupuesto/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Presupuestos"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
