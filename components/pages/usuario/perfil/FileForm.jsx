import React, {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import {
  fetchUserApi,
} from "../../../../lib/api/generator.js";

const formatDate = (date) => {
  const parsed_date = new Date(date);
  if (parsed_date.valueOf()) {
    const year = parsed_date.getFullYear();
    let month = parsed_date.getMonth();
    month = month < 10 ? `0${month}` : month;
    let day = parsed_date.getDate();
    day = day < 10 ? `0${day}` : day;
    let hours = parsed_date.getHours();
    hours = hours < 10 ? `0${hours}` : hours;
    let minutes = parsed_date.getMinutes();
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } else {
    return "Fecha no valida";
  }
};

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

export default function FileForm() {
  const [table_data, setTableData] = useState([]);

  const updateFileTable = () => {
    getUserFiles()
      .then(async (response) => {
        if (response.ok) {
          setTableData(await response.json());
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        console.error("couldnt load table");
      });
  };

  const uploadFile = (template, event) => {
    const file = event.target.files[0];

    uploadUserFile(template, file.name, file)
      .then((response) => {
        if (response.ok) {
          updateFileTable();
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        console.error("couldnt upload file");
      });
  };

  useEffect(() => {
    updateFileTable();
  }, []);

  return (
    <Fragment>
      <TableContainer component={Paper}>
        <Typography
          component="h2"
          variant="h5"
        >
          Soportes
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Soporte</TableCell>
              <TableCell align="center"></TableCell>
              <TableCell align="center">Ultima Carga</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {table_data.map(({
              template,
              template_id,
              upload_date,
            }) => (
              <TableRow key={template_id}>
                <TableCell component="th" scope="row">
                  {template}
                </TableCell>
                <TableCell align="center">
                  <input
                    onChange={(event) => uploadFile(template_id, event)}
                    type="file"
                  />
                </TableCell>
                <TableCell align="center">
                  {upload_date
                    ? formatDate(upload_date)
                    : "El archivo no ha sido cargado"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  );
}
