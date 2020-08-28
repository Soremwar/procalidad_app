import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DialogContentText,
  Grid,
  TextField,
} from "@material-ui/core";
import {
  formatResponseJson,
} from "../../../lib/api/request.js";
import {
  fetchClientApi,
  fetchSectorApi,
} from "../../../lib/api/generator.js";
import CitySelector from "../../common/CitySelector.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

const getSectors = () => {
  return fetchSectorApi()
    .then((x) => x.json())
    .then((x) => Object.values(x));
};

const getClient = (id) => fetchClientApi(id).then((x) => x.json());

const createClient = async (
  address,
  business,
  city,
  name,
  nit,
  sector,
  verification_digit,
) =>
  fetchClientApi("", {
    body: JSON.stringify({
      address,
      business,
      city,
      name,
      nit,
      sector,
      verification_digit,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateClient = async (
  id,
  address,
  business,
  city,
  name,
  nit,
  sector,
  verification_digit,
) =>
  fetchClientApi(id, {
    body: JSON.stringify({
      sector,
      address,
      business,
      city,
      name,
      nit,
      verification_digit,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteClient = async (id) =>
  fetchClientApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Nombre",
    searchable: true,
  },
  {
    id: "sector",
    numeric: false,
    disablePadding: false,
    label: "Sector",
    searchable: true,
  },
  {
    id: "business",
    numeric: false,
    disablePadding: false,
    label: "Razon Social",
    searchable: true,
  },
  {
    id: "nit",
    numeric: false,
    disablePadding: false,
    label: "NIT",
    searchable: true,
  },
];

const ParameterContext = createContext({
  sectors: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    sectors,
  } = useContext(ParameterContext);

  const [error, setError] = useState(null);
  const [fields, setFields] = useState({
    address: "",
    business: "",
    city: "",
    name: "",
    nit: "",
    sector: "",
    verification_digit: "",
  });
  const [is_loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createClient(
      fields.address,
      fields.business,
      fields.city,
      fields.name,
      fields.nit,
      fields.sector,
      fields.verification_digit,
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

  useEffect(() => {
    if (is_open) {
      setError(null);
      setFields({
        address: "",
        business: "",
        city: "",
        name: "",
        nit: "",
        sector: "",
        verification_digit: "",
      });
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
      title={"Crear Nuevo"}
    >
      <SelectField
        fullWidth
        label="Sector"
        name="sector"
        onChange={handleChange}
        required
        value={fields.sector}
      >
        {sectors.map(({ pk_sector, nombre }) => (
          <option key={pk_sector} value={pk_sector}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        fullWidth
        label="Nombre Cliente"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        label="NIT"
        margin="dense"
        name="nit"
        onChange={handleChange}
        required
        value={fields.nit}
      />
      <TextField
        fullWidth
        label="Digito de Verificacion"
        margin="dense"
        name="verification_digit"
        onChange={handleChange}
        required
        value={fields.verification_digit}
      />
      <TextField
        fullWidth
        label="Razon Social"
        margin="dense"
        name="business"
        onChange={handleChange}
        required
        value={fields.business}
      />
      <CitySelector
        required
        setValue={(value) =>
          setFields((prev_state) => ({ ...prev_state, city: value }))}
        value={fields.city}
      />
      <TextField
        fullWidth
        label="Direccion"
        margin="dense"
        name="address"
        onChange={handleChange}
        required
        value={fields.address}
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
    sectors,
  } = useContext(ParameterContext);

  const [error, setError] = useState(null);
  const [fields, setFields] = useState({
    address: "",
    business: "",
    city: null,
    name: "",
    nit: "",
    sector: "",
    verification_digit: "",
  });
  const [is_loading, setLoading] = useState(false);

  useEffect(() => {
    if (is_open) {
      setFields({
        address: data.direccion,
        business: data.razon_social,
        city: data.fk_ciudad,
        name: data.nombre,
        nit: data.nit,
        sector: data.fk_sector,
        verification_digit: data.d_verificacion,
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

    const request = await updateClient(
      data.pk_cliente,
      fields.address,
      fields.business,
      fields.city,
      fields.name,
      fields.nit,
      fields.sector,
      fields.verification_digit,
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
      title={"Editar"}
    >
      <SelectField
        fullWidth
        label="Sector"
        name="sector"
        onChange={handleChange}
        required
        value={fields.sector}
      >
        {sectors.map(({ pk_sector, nombre }) => (
          <option key={pk_sector} value={pk_sector}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        margin="dense"
        name="name"
        label="Nombre Cliente"
        fullWidth
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
        name="nit"
        label="NIT"
        fullWidth
        onChange={handleChange}
        required
        value={fields.nit}
      />
      <TextField
        margin="dense"
        name="verification_digit"
        label="Digito de Verificacion"
        fullWidth
        onChange={handleChange}
        required
        value={fields.verification_digit}
      />
      <TextField
        margin="dense"
        name="business"
        label="Razon Social"
        fullWidth
        onChange={handleChange}
        required
        value={fields.business}
      />
      <CitySelector
        required
        setValue={(value) =>
          setFields((prev_state) => ({ ...prev_state, city: value }))}
        value={fields.city}
      />
      <TextField
        margin="dense"
        name="address"
        label="Direccion"
        fullWidth
        onChange={handleChange}
        required
        value={fields.address}
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

    const delete_progress = selected.map((id) => deleteClient(id));

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
  const [parameters, setParameters] = useState({
    sectors: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_contact, setSelectedContact] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    const data = await getClient(id);
    setSelectedContact(data);
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
    getSectors().then((sectors) =>
      setParameters((prev_state) => ({ ...prev_state, sectors }))
    );
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Clientes"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_contact}
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
              url={"clientes/cliente/table"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
