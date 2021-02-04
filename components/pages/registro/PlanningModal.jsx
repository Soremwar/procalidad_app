import React, { forwardRef, useContext, useEffect, useState } from "react";
import {
  AppBar,
  Dialog,
  DialogContent,
  IconButton,
  Slide,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Close as CloseIcon } from "@material-ui/icons";
import { fetchUserApi } from "../../../lib/api/generator.js";
import Heatmap from "./PlanningModal/Heatmap.jsx";
import { ParameterContext } from "../registro.jsx";

const getHeatmapData = () =>
  fetchUserApi(`planeacion`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const planningModalStyles = makeStyles(() => ({
  appBar: {
    position: "relative",
  },
  heatmap: {
    padding: "20px",
  },
  modal_content: {
    padding: "0 0 0 0 !important",
  },
}));

export default function PlanningModal({
  closeModal,
  end_date,
  is_open,
  start_date,
}) {
  const classes = planningModalStyles();

  const {
    heatmap_blacklisted_dates,
  } = useContext(ParameterContext);

  const [should_update, setShouldUpdate] = useState(false);

  useEffect(() => {
    if (is_open) {
      setShouldUpdate(true);
    }
  }, [is_open]);

  return (
    <Dialog
      fullScreen
      onClose={closeModal}
      open={is_open}
      TransitionComponent={Transition}
    >
      <DialogContent
        className={classes.modal_content}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={closeModal}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6">
              Planeación
            </Typography>
          </Toolbar>
        </AppBar>
        <Heatmap
          blacklisted_dates={heatmap_blacklisted_dates}
          end_date={end_date}
          getSource={() => getHeatmapData()}
          onUpdate={() => setShouldUpdate(false)}
          should_update={should_update}
          start_date={start_date}
        />
      </DialogContent>
    </Dialog>
  );
}
