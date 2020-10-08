import React, { Fragment, useEffect, useState } from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../../lib/api/request.js";
import { fetchCertificationProviderApi } from "../../../../lib/api/generator.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import DialogForm from "../../../common/DialogForm.jsx";
import Title from "../../../common/Title.jsx";

const getCertificationProvider = (id) => fetchCertificationProviderApi(id);

const createCertificacionProvider = async (
  name,
) =>
  fetchCertificationProviderApi("", {
    body: JSON.stringify({
      name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateCertificationProvider = async (
  id,
  name,
) =>
  fetchCertificationProviderApi(id, {
    body: JSON.stringify({
      name,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteCertificationProvider = async (id) =>
  fetchCertificationProviderApi(id, {
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
];

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    name: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: "",
      });
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createCertificacionProvider(
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
          setFields((prevState) => ({ ...prevState, name }));
        }}
        required
        value={fields.name}
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
    name: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateCertificationProvider(
      data.id,
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
        inputProps={{
          maxLength: 50,
        }}
        label="Nombre"
        name="name"
        onChange={(event) => {
          const name = event.target.value.toUpperCase();
          setFields((prevState) => ({ ...prevState, name }));
        }}
        required
        value={fields.name}
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

    const delete_progress = selected.map((id) =>
      deleteCertificationProvider(id)
    );

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

export default function ProveedorCertificacion() {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_support, setSelectedSupport] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    await getCertificationProvider(id)
      .then(async (response) => {
        if (response.ok) {
          const certification_type = await response.json();
          setSelectedSupport(certification_type);
          setEditModalOpen(true);
        } else {
          throw new Error();
        }
      })
      .catch(() => console.log("Couldnt load the requested type"));
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
      <Title title="Proveedor de certificación" />
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
        url="maestro/certificacion/proveedor/table"
      />
    </Fragment>
  );
}
