import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  Cancel as RejectIcon,
  CheckCircle as ApproveIcon,
  GetApp as DownloadIcon,
} from "@material-ui/icons";
import {
  fetchHRSupportFiles,
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import { formatDateToStringDatetime } from "../../../../lib/date/mod.js";
import AsyncTable from "../../../common/AsyncTable/Table.jsx";
import InputField from "../../../common/FileField.jsx";
import ObservationsDialog from "../common/ObservationsDialog.jsx";
import ReviewBadge from "../common/ReviewBadge.jsx";

const uploadUserFile = async (
  template,
  name,
  file,
) => {
  const data = new FormData();
  data.append(name, file);
  return fetchUserApi(`soportes/${template}`, {
    body: data,
    method: "PUT",
  });
};

const getUserFiles = () => fetchUserApi("soportes");
const getPersonFiles = (person) => fetchHRSupportFiles(`/table/${person}`);

const reviewSupportFile = async (
  code,
  approved,
  observations,
) =>
  fetchHRSupportFiles(code, {
    body: JSON.stringify({
      approved,
      observations,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

export default function FileForm({
  person,
  review_mode,
}) {
  const [loading, setLoading] = useState(false);
  const [observations_modal_open, setObservationsModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);
  const [code, setCode] = useState();

  const uploadFile = (template, files, onUpload) => {
    const file = files[0];

    uploadUserFile(template, file.name, file)
      .then((response) => {
        if (response.ok) {
          onUpload();
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        console.error("couldnt upload file");
      });
  };

  const handleReview = (code, approved, observations) => {
    setLoading(true);

    reviewSupportFile(code, approved, observations)
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }
      })
      .catch(() => console.error("couldnt submit review"))
      .finally(() => {
        setTableShouldUpdate(true);
        setLoading(false);
      });
  };

  const review_headers = [
    {
      id: "template",
      label: "Soporte",
      searchable: false,
      orderable: true,
    },
    {
      displayAs: (id, value) => (
        <Button
          color="primary"
          component="a"
          endIcon={<DownloadIcon />}
          href={`/api/archivos/plantilla/${value.split("_").join("/")}`}
          target="_blank"
          variant="contained"
        >
          Descargar
        </Button>
      ),
      id: "id",
      align: "center",
      label: "Descargar",
      searchable: false,
      orderable: false,
    },
    {
      displayAs: (id, value) => (
        <Grid container spacing={3} justify="center">
          {loading ? <CircularProgress /> : (
            <Fragment>
              <Grid container item md={6} justify="flex-end">
                <Tooltip title="Rechazar">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setCode(value);
                      setObservationsModalOpen(true);
                    }}
                  >
                    <RejectIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid container item md={6} justify="flex-start">
                <Tooltip title="Aprobar">
                  <IconButton
                    color="primary"
                    onClick={() => handleReview(value, true)}
                  >
                    <ApproveIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Fragment>
          )}
        </Grid>
      ),
      id: "id",
      align: "center",
      label: "Acciones",
      searchable: false,
      orderable: false,
    },
  ];

  const person_headers = [
    {
      id: "template",
      label: "Soporte",
      searchable: false,
      orderable: true,
    },
    {
      displayAs: (id, _v, updateTable) => (
        <InputField
          label="Cargar archivo"
          loading={loading}
          onChange={(event) => uploadFile(id, event, updateTable)}
        />
      ),
      id: "id",
      align: "center",
      searchable: false,
      orderable: false,
    },
    {
      displayAs: (id) => (
        <Button
          color="primary"
          component="a"
          endIcon={<DownloadIcon />}
          href={`/api/archivos/plantilla/${id}`}
          target="_blank"
          variant="contained"
        >
          Descargar
        </Button>
      ),
      id: "id",
      align: "center",
      searchable: false,
      orderable: false,
    },
    {
      id: "upload_date",
      label: "Última carga",
      searchable: false,
      orderable: false,
    },
    {
      displayAs: (_id, value) => (
        <Typography color="primary" variant="h6">{value}</Typography>
      ),
      id: "observations",
      label: "Comentarios",
      searchable: false,
      orderable: false,
    },
    {
      displayAs: (_id, value) => (
        <ReviewBadge status={value} />
      ),
      align: "center",
      id: "review_status",
      searchable: false,
      orderable: false,
    },
  ];

  useEffect(() => {
    if (!review_mode) {
      setTableShouldUpdate(true);
    }
  }, []);

  useEffect(() => {
    if (review_mode && person) {
      setTableShouldUpdate(true);
    }
  }, [person]);

  return (
    <Fragment>
      <AsyncTable
        columns={review_mode ? review_headers : person_headers}
        disable_selection={true}
        onTableUpdate={() => setTableShouldUpdate(false)}
        search={review_mode
          ? {
            person,
            review_status: 2,
          }
          : {}}
        update_table={tableShouldUpdate}
        url={review_mode ? "humanos/persona/soporte/table" : "usuario/soportes"}
      />
      <ObservationsDialog
        onClose={() => setObservationsModalOpen(false)}
        onConfirm={(observations) => {
          handleReview(code, false, observations);
          setObservationsModalOpen(false);
        }}
        open={observations_modal_open}
      />
    </Fragment>
  );
}
