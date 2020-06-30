import React, {
  useContext,
} from "react";
import { makeStyles } from "@material-ui/styles";
import {
  TableRow,
  Tooltip,
} from "@material-ui/core";
import {
  getRandomColor,
} from "../../../../lib/colors/mod.js";
import Heatmap, {
  CleanTableCell,
  DateParameters,
  DetailDot,
} from "./Heatmap.jsx";

const DetailCell = ({
  assignation,
  color = null,
  value = null,
}) => (
  <CleanTableCell>
    <Tooltip title={`Horas: ${value || 0}\n Asignacion: ${assignation}%`}>
      <div>
        <DetailDot
          color={color}
          status={value && color ? null : "invalid"}
        />
      </div>
    </Tooltip>
  </CleanTableCell>
);

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
}) => {
  const { calendar_dates } = useContext(DateParameters);

  return data.map(({ project_id, project, dates }) => {
    const color = getRandomColor();

    return (
      <DetailTableRow key={project_id}>
        <CleanTableCell>
          {project}
        </CleanTableCell>
        {calendar_dates.map((calendar_date) => {
          const activity = dates.find(({ date }) => calendar_date == date);
          return (
            <DetailCell
              assignation={activity ? Number(activity.assignation) : 0}
              color={activity ? color : null}
              key={calendar_date}
              value={activity ? Number(activity.hours) : 0}
            />
          );
        })}
      </DetailTableRow>
    );
  });
};

export default ({
  blacklisted_dates,
  data,
  end_date,
  start_date,
}) => (
  <Heatmap
    blacklisted_dates={blacklisted_dates}
    end_date={end_date}
    start_date={start_date}
  >
    <HeatmapData data={data} />
  </Heatmap>
);
