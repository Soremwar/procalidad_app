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

import AsyncSelectField from "../../common/AsyncSelectField.jsx";
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

const createClient = async (form_data) => {
  return fetchClientApi('', {
    method: "POST",
    body: form_data,
  });
};

const updateClient = async (id, form_data) => {
  return fetchClientApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteClient = async (id) => {
  return fetchClientApi(id, {
    method: "DELETE",
  });
};

const headers = [
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  {
    id: "business",
    numeric: false,
    disablePadding: false,
    label: "Razon Social",
  },
  { id: "nit", numeric: false, disablePadding: false, label: "NIT" },
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
    sector: "",
    name: "",
    nit: "",
    verification_digit: "",
    business: "",
    country: "",
    state: "",
    city: "",
    address: "",
  });
  const [city_query, setCityQuery] = useState("");
  const [country_query, setCountryQuery] = useState("");
  const [is_loading, setLoading] = useState(false);
  const [state_query, setStateQuery] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createClient(new URLSearchParams(fields));

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
        sector: "",
        name: "",
        nit: "",
        verification_digit: "",
        business: "",
        country: "",
        state: "",
        city: "",
        address: "",
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
      <AsyncSelectField
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_pais,
            nombre,
          }) => {
            return { value: String(pk_pais), text: nombre };
          })
        )}
        label="Pais"
        margin="dense"
        name="country"
        onChange={handleChange}
        onType={(event) => {
          if (fields.country) {
            setFields((old_state) => ({ ...old_state, country: "" }));
          }
          const value = event.target.value;
          setCountryQuery(value);
        }}
        required
        source={`maestro/pais/search?query=${encodeURI(
          fields.country
            ? ""
            : country_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}&limit=10`}
        value={fields.country}
      />
      <AsyncSelectField
        disabled={!fields.country}
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_estado,
            nombre,
          }) => {
            return { value: String(pk_estado), text: nombre };
          })
        )}
        label="Departamento"
        margin="dense"
        name="state"
        onChange={handleChange}
        onType={(event) => {
          if (fields.state) {
            setFields((old_state) => ({ ...old_state, state: "" }));
          }
          const value = event.target.value;
          setStateQuery(value);
        }}
        required
        source={`maestro/estado/search?country=${fields.country}&query=${encodeURI(
          fields.state
            ? ""
            : state_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.country && fields.state}
      />
      <AsyncSelectField
        disabled={!(fields.country && fields.state)}
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_ciudad,
            nombre,
          }) => {
            return { value: String(pk_ciudad), text: nombre };
          })
        )}
        label="Ciudad"
        margin="dense"
        name="city"
        onChange={handleChange}
        onType={(event) => {
          if (!fields.city) {
            setFields((old_state) => ({ ...old_state, city: "" }));
          }
          const value = event.target.value;
          setCityQuery(value);
        }}
        required
        source={`maestro/ciudad/search?state=${fields.state}&query=${encodeURI(
          fields.city
            ? ""
            : city_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.country && fields.state && fields.city}
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

  const [city_query, setCityQuery] = useState("");
  const [country_query, setCountryQuery] = useState("");
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({});
  const [is_loading, setLoading] = useState(false);
  const [state_query, setStateQuery] = useState("");

  useEffect(() => {
    if (is_open) {
      setFields({
        sector: data.fk_sector,
        name: data.nombre,
        nit: data.nit,
        verification_digit: data.d_verificacion,
        business: data.razon_social,
        country: String(data.fk_pais),
        state: String(data.fk_estado),
        city: String(data.fk_ciudad),
        address: data.direccion,
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

    const request = await updateClient(data.pk_cliente, new URLSearchParams(fields));

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
      <AsyncSelectField
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_pais,
            nombre,
          }) => {
            return { value: String(pk_pais), text: nombre };
          })
        )}
        label="Pais"
        margin="dense"
        name="country"
        onChange={handleChange}
        onType={(event) => {
          if (fields.country) {
            setFields((old_state) => ({ ...old_state, country: "" }));
          }
          const value = event.target.value;
          setCountryQuery(value);
        }}
        preload
        required
        source={`maestro/pais/search?query=${encodeURI(
          fields.country
            ? ""
            : country_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.country}
      />
      <AsyncSelectField
        disabled={!fields.country}
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_estado,
            nombre,
          }) => {
            return { value: String(pk_estado), text: nombre };
          })
        )}
        label="Departamento"
        margin="dense"
        name="state"
        onChange={handleChange}
        onType={(event) => {
          if (fields.state) {
            setFields((old_state) => ({ ...old_state, state: "" }));
          }
          const value = event.target.value;
          setStateQuery(value);
        }}
        preload
        required
        source={`maestro/estado/search?country=${fields.country}&query=${encodeURI(
          fields.state
            ? ""
            : state_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.country && fields.state}
      />
      <AsyncSelectField
        disabled={!(fields.country && fields.state)}
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_ciudad,
            nombre,
          }) => {
            return { value: String(pk_ciudad), text: nombre };
          })
        )}
        label="Ciudad"
        margin="dense"
        name="city"
        onChange={handleChange}
        onType={(event) => {
          if (fields.city) {
            setFields((old_state) => ({ ...old_state, city: "" }));
          }
          const value = event.target.value;
          setCityQuery(value);
        }}
        preload
        required
        source={`maestro/ciudad/search?state=${fields.state}&query=${encodeURI(
          fields.city
            ? ""
            : city_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.country && fields.state && fields.city}
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
  const [parameters, setParameters] = useState({
    sectors: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_contact, setSelectedContact] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);
  const [selected_sector, setSelectedSector] = useState("");

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
    getSectors().then(sectors => setParameters(prev_state => ({...prev_state, sectors})));
  }, []);

  useEffect(() => {
    updateTable();
  }, [selected_sector]);

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
      <Grid container spacing={10}>
        <Grid item xs={6}>
          <SelectField
            fullWidth
            label="Sector"
            onChange={event => setSelectedSector(event.target.value)}
            value={selected_sector}
          >
            {parameters.sectors.map(({ pk_sector, nombre }) => (
              <option key={pk_sector} value={pk_sector}>{nombre}</option>
            ))}
          </SelectField>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget noBodyPadding>
            <AsyncTable
              data_source={"/clientes/cliente/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              search={{
                code_sector: selected_sector,
              }}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Clientes"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
