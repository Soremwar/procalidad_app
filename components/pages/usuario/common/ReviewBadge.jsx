import React from "react";
import { Avatar, colors, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  Block as RejectedIcon,
  DoneOutline as ApprovedIcon,
  HelpOutline as NotElegibleIcon,
  Timer as PendingIcon,
} from "@material-ui/icons";

const useApprovalBadgeStyles = makeStyles(() => ({
  icon_approved: {
    backgroundColor: colors.green[500],
    color: "white",
  },
  icon_not_eligible: {
    backgroundColor: colors.blue[500],
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

/** @type Map<string, string> */
const Messages = new Map(Object.entries({
  0: "Rechazado",
  1: "Aprobado",
  2: "En revisión",
  3: "No elegible para revisión",
}));

/**
 * 0 stands for rejected
 * 1 stands for approved
 * 2 stands for awaiting review
 * 3 stands for not eligible for review
 * @param {object} props
 * @param {(0 | 1 | 2 | 3)} props.status
 * */
export default function ReviewBadge({
  status,
}) {
  const classes = useApprovalBadgeStyles();

  let icon_text = Messages.get(String(status));

  let Icon;
  let icon_class_status;

  switch(status){
    case 0:
      Icon = RejectedIcon;
      icon_class_status = classes.icon_rejected;
      break;
    case 1:
      Icon = ApprovedIcon;
      icon_class_status = classes.icon_approved;
      break;
    case 2:
      Icon = PendingIcon;
      icon_class_status = classes.icon_pending;
      break;
    case 3:
      Icon = NotElegibleIcon;
      icon_class_status = classes.icon_not_eligible;
      break;
    default:
      throw new Error(`Value other than valid status provided: "${status}"`);
  }

  return (
    <Tooltip title={icon_text}>
      <Avatar className={icon_class_status}>
        <Icon/>
      </Avatar>
    </Tooltip>
  );
}
