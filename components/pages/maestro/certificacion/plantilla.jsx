import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../../lib/api/request.js";
import {
  fetchCertificationProviderApi,
  fetchCertificationTemplateApi,
} from "../../../../lib/api/generator.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import SelectField from "../../../common/SelectField.jsx";
import Title from "../../../common/Title.jsx";

const getProviders = () => fetchCertificationProviderApi();

const getCertification = (id) => fetchCertificationTemplateApi(id);

const createCertificacion = async (
  name,
  provider,
) =>
  fetchCertificationTemplateApi("", {
    body: JSON.stringify({
      name,
      provider,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateCertification = async (
  id,
  name,
  provider,
) =>
  fetchCertificationTemplateApi(id, {
    body: JSON.stringify({
      name,
      provider,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteCertification = async (id) =>
  fetchCertificationTemplateApi(id, {
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
    id: "provider",
    numeric: false,
    disablePadding: false,
    label: "Proveedor",
    searchable: true,
  },
];

const DEFAULT_PARAMETERS = {
  providers: [],
};
const ParameterContext = createContext(DEFAULT_PARAMETERS);

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    providers,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    name: "",
    provider: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: "",
        provider: "",
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

    const request = await createCertificacion(
      fields.name,
      fields.provider,
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
      title={"Crear Nuevo"}
    >
      <TextField
        fullWidth
        inputProps={{
          maxLength: 50,
        }}
        label="Nombre"
        name="name"
        onChange={(event) => {
          const name = event.target.value.toUpperCase();
          setFields((prev_state) => ({ ...prev_state, name }));
        }}
        required
        value={fields.name}
      />
      <SelectField
        fullWidth
        label="Proveedor"
        name="provider"
        onChange={handleChange}
        required
        value={fields.provider}
      >
        {providers.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </SelectField>
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
    providers,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    name: "",
    provider: "",
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

    const request = await updateCertification(
      data.id,
      fields.name,
      fields.provider,
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
      setFields({
        name: data.name,
        provider: data.provider,
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Editar"}
    >
      <TextField
        fullWidth
        inputProps={{
          maxLength: 50,
        }}
        label="Nombre"
        name="name"
        onChange={(event) => {
          const name = event.target.value.toUpperCase();
          setFields((prev_state) => ({ ...prev_state, name }));
        }}
        required
        value={fields.name}
      />
      <SelectField
        fullWidth
        label="Proveedor"
        name="provider"
        onChange={handleChange}
        required
        value={fields.provider}
      >
        {providers.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </SelectField>
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

    const delete_progress = selected.map((id) => deleteCertification(id));

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
      title="Eliminar Elementos"
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

export default function Plantilla() {
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_support, setSelectedSupport] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getCertification(id)
      .then(async (response) => {
        if (response.ok) {
          const certification_type = await response.json();
          setSelectedSupport(certification_type);
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Couldnt load the requested type"));
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    getProviders()
      .then(async (response) => {
        if (response.ok) {
          /**@type Array<{id: number, name: string}>*/
          const providers = await response.json();
          setParameters((prevState) => ({
            ...prevState,
            providers: providers
              .sort(({ name: x }, { name: y }) => x.localeCompare(y)),
          }));
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("couldn't load providers"));
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title="Certificación" />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_support}
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
      <AsyncTable
        columns={headers}
        onAddClick={() => setAddModalOpen(true)}
        onEditClick={(id) => handleEditModalOpen(id)}
        onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
        onTableUpdate={() => setTableShouldUpdate(false)}
        update_table={tableShouldUpdate}
        url="maestro/certificacion/plantilla/table"
      />
    </Fragment>
  );
}
