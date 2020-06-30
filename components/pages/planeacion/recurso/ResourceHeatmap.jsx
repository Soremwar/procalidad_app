import React, {
  useContext,
} from "react";
import { makeStyles } from "@material-ui/styles";
import {
  TableRow,
  Tooltip,
} from "@material-ui/core";
import Heatmap, {
  CleanTableCell,
  DateParameters,
  DetailDot,
} from "./Heatmap.jsx";

const AvailabilityCell = ({
  available,
  value = null,
}) => {
  let status;

  if (value === 9) {
    status = "error";
  } else if (value === 0) {
    status = "ok";
  } else if (value > 0 && value < 9) {
    status = "warning";
  } else {
    status = "invalid";
  }

  return (
    <CleanTableCell>
      <Tooltip title={`Horas: ${value ?? 9}\n Disponible: ${available}%`}>
        <div>
          <DetailDot status={status} />
        </div>
      </Tooltip>
    </CleanTableCell>
  );
};

const OcupationCell = ({
  assignation,
  value = null,
}) => {
  let status;

  if (value === 0) {
    status = "error";
  } else if (value === 9) {
    status = "ok";
  } else if (value > 0 && value < 9) {
    status = "warning";
  } else {
    status = "invalid";
  }

  return (
    <CleanTableCell>
      <Tooltip title={`Horas: ${value ?? 0}\n Asignacion: ${assignation}%`}>
        <div>
          <DetailDot status={status} />
        </div>
      </Tooltip>
    </CleanTableCell>
  );
};

const detailRowStyles = makeStyles({
  row: {
    height: "30px",
    margin: 0,
    padding: "0px",
  },
});

const DetailTableRow = ({ children, className = "", ...props }) => {
  const styles = detailRowStyles();
  return (
    <TableRow
      className={[styles.row, ...className.split(" ")].join(" ")}
      {...props}
    >
      {children}
    </TableRow>
  );
};

const HeatmapData = ({
  data,
  type,
}) => {
  const { calendar_dates } = useContext(DateParameters);

  return data.map(({ person_id, person, dates }) => (
    <DetailTableRow key={person_id}>
      <CleanTableCell>
        {person}
      </CleanTableCell>
      {calendar_dates.map((calendar_date) => {
        const activity = dates.find(({ date }) => calendar_date == date);
        if (type === "availability") {
          return (
            <AvailabilityCell
              available={activity ? Number(activity.assignation) : 100}
              key={calendar_date}
              value={activity ? Number(activity.hours) : 9}
            />
          );
        } else {
          return (
            <OcupationCell
              assignation={activity ? Number(activity.assignation) : 0}
              key={calendar_date}
              value={activity ? Number(activity.hours) : 0}
            />
          );
        }
      })}
    </DetailTableRow>
  ));
};

export default ({
  blacklisted_dates,
  data,
  end_date,
  start_date,
  type,
}) => (
  <Heatmap
    blacklisted_dates={blacklisted_dates}
    end_date={end_date}
    start_date={start_date}
  >
    <HeatmapData data={data} type={type} />
  </Heatmap>
);
