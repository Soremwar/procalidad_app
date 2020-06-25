import React, {
  Fragment,
  useEffect,
  useState
} from "react";
import {
  DialogContentText,
  Grid,
  TextField
} from "@material-ui/core";

import {
  formatResponseJson,
  requestGenerator,
} from "../../../lib/api/request.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const fetchBudgetTypeApi = requestGenerator('operaciones/tipo_presupuesto');

const getBudgetType = (id) => fetchBudgetTypeApi(id).then((x) => x.json());

const createBudgetType = async (form_data) => {
  return await fetchBudgetTypeApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateBudgetType = async (id, form_data) => {
  return await fetchBudgetTypeApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteBudgetType = async (id) => {
  return await fetchBudgetTypeApi(id, {
    method: "DELETE",
  });
};

const headers = [
  { id: "name", numeric: false, disablePadding: false, label: "Nombre", searchable: true },
  { id: "description", numeric: false, disablePadding: false, label: "Descripcion", searchable: true },
];

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const request = await createBudgetType(new URLSearchParams(form_data));

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
        autoFocus
        margin="dense"
        name="name"
        label="Nombre"
        fullWidth
        required
      />
      <TextField
        autoFocus
        margin="dense"
        name="description"
        label="Descripcion"
        fullWidth
        required
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
  const [fields, setFields] = useState({
    name: '',
    description: '',
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: data.nombre,
        description: data.descripcion,
      });
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

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const id = data.pk_tipo;
    const request = await updateBudgetType(id, new URLSearchParams(form_data));

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
      <TextField
        autoFocus
        fullWidth
        label="Nombre"
        margin="dense"
        name="name"
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        autoFocus
        fullWidth
        label="Descripcion"
        margin="dense"
        name="description"
        onChange={(event) => handleChange(event)}
        required
        value={fields.description}
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

    const delete_progress = selected.map((id) => deleteBudgetType(id));

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
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_budget_type, setSelectedBudgetType] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    const data = await getBudgetType(id);
    setSelectedBudgetType(data);
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
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Tipo de Presupuesto"} />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        data={selected_budget_type}
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
            <AsyncTable
              columns={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              onTableUpdate={() => setTableShouldUpdate(false)}
              update_table={tableShouldUpdate}
              url={"operaciones/tipo_presupuesto/table"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
