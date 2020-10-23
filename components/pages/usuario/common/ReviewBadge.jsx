import React from "react";
import { Avatar, colors, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  Block as RejectedIcon,
  DoneOutline as ApprovedIcon,
  Timer as PendingIcon,
} from "@material-ui/icons";

const useApprovalBadgeStyles = makeStyles(() => ({
  icon_approved: {
    backgroundColor: colors.green[500],
    color: "white",
  },
  icon_pending: {
    backgroundColor: colors.yellow[500],
    color: "black",
  },
  icon_rejected: {
    backgroundColor: colors.red[500],
    color: "white",
  },
}));

/**
 * @param {object} props
 * @param {(0 | 1 | 2)} props.status
 * */
export default function ReviewBadge({
  status,
}) {
  const classes = useApprovalBadgeStyles();
  const approved = status === 1;
  const rejected = status === 0;

  const icon_text = approved
    ? "Aprobado"
    : rejected
    ? "Rechazado"
    : "En revisión";

  const icon_class_status = approved
    ? classes.icon_approved
    : rejected
    ? classes.icon_rejected
    : classes.icon_pending;

  return (
    <Tooltip title={icon_text}>
      <Avatar className={icon_class_status}>
        {approved
          ? <ApprovedIcon />
          : rejected
          ? <RejectedIcon />
          : <PendingIcon />}
      </Avatar>
    </Tooltip>
  );
}
