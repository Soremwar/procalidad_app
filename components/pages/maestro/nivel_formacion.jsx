import React, {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  DialogContentText,
  TextField,
} from "@material-ui/core";
import {
  formatResponseJson,
} from "../../../lib/api/request.js";
import {
  fetchFormationLevelApi,
} from "../../../lib/api/generator.js";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import SelectField from "../../common/SelectField.jsx";
import Title from "../../common/Title.jsx";

const FormationType = [
  "Academica",
  "Continuada",
  "Capacitaciones",
];

const getFormationLevel = (id) => fetchFormationLevelApi(id);

const createFormation = async (
  formation_type,
  name,
) =>
  fetchFormationLevelApi("", {
    body: JSON.stringify({
      formation_type,
      name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateFormationLevel = async (
  id,
  formation_type,
  name,
) =>
  fetchFormationLevelApi(id, {
    body: JSON.stringify({
      formation_type,
      name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteLicense = async (id) =>
  fetchFormationLevelApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "formation_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de formación",
    searchable: true,
  },
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Nombre",
    searchable: true,
  },
];

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    formation_type: "",
    name: "",
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

    const request = await createFormation(
      fields.formation_type,
      fields.name,
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
        formation_type: "",
        name: "",
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
      title={"Crear Nuevo"}
    >
      <TextField
        fullWidth
        InputProps={{
          inputProps: {
            maxLength: "50",
          },
        }}
        label="Nombre"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <SelectField
        fullWidth
        label="Tipo de formación"
        name="formation_type"
        onChange={handleChange}
        required
        value={fields.formation_type}
      >
        {FormationType.map((x) => (
          <option key={x} value={x}>{x}</option>
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
  const [fields, setFields] = useState({
    formation_type: "",
    name: "",
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

    const request = await updateFormationLevel(
      data.id,
      fields.formation_type,
      fields.name,
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
        formation_type: data.formation_type,
        name: data.name,
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
        label="Nombre"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <SelectField
        disabled
        fullWidth
        label="Tipo de formación"
        name="formation_type"
        onChange={handleChange}
        value={fields.formation_type}
      >
        {FormationType.map((x) => (
          <option key={x} value={x}>{x}</option>
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

    const delete_progress = selected.map((id) => deleteLicense(id));

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
      title={"Eliminar Elementos"}
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
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_academic_title, setSelectedAcademicTitle] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getFormationLevel(id)
      .then(async (response) => {
        if (response.ok) {
          setSelectedAcademicTitle(await response.json());
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("couldnt load the formation level requested"));
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Nivel de formación"} />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        data={selected_academic_title}
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
      <AsyncTable
        columns={headers}
        onAddClick={() => setAddModalOpen(true)}
        onEditClick={(id) => handleEditModalOpen(id)}
        onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
        onTableUpdate={() => setTableShouldUpdate(false)}
        update_table={tableShouldUpdate}
        url={"maestro/nivel_formacion/table"}
      />
    </Fragment>
  );
};
