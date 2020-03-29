import React, { useState } from "react";
import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography
} from "@material-ui/core";
import { Inbox as InboxIcon } from "@material-ui/icons";
import { Link } from "react-router-dom";

import Dot from "../Dot.jsx";
import useStyles from "./styles.js";

export default function SidebarLink({
  link,
  icon,
  label,
  children,
  location,
  isSidebarOpened,
  nested,
  type,
}) {
  const classes = useStyles();

  const [isOpen, setIsOpen] = useState(false);
  const isLinkActive = link &&
    (location.pathname === link || location.pathname.indexOf(link) !== -1);

  function toggleCollapse(e) {
    if (isSidebarOpened) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  }

  if (type === "title") {
    return (
      <Typography
        className={[
          classes.linkText,
          classes.sectionTitle,
          ...(isSidebarOpened ? [] : [classes.linkTextHidden]),
        ].join(" ")}
      >
        {label}
      </Typography>
    );
  }

  if (type === "divider") return <Divider className={classes.divider} />;

  if (!children) {
    return (
      <ListItem
        button
        component={link && Link}
        to={link}
        className={classes.link}
        classes={{
          root: [
            classes.linkRoot,
            ...((isLinkActive && !nested) ? [classes.linkActive] : []),
            ...(nested ? [classes.linkNested] : []),
          ].join(" "),
        }}
        disableRipple
      >
        <ListItemIcon
          className={[
            classes.linkIcon,
            ...(isLinkActive ? [classes.linkIconActive] : []),
          ].join(" ")}
        >
          {nested ? <Dot color={isLinkActive && "primary"} /> : icon}
        </ListItemIcon>
        <ListItemText
          classes={{
            primary: [
              classes.linkText,
              ...(isLinkActive ? [classes.linkTextActive] : []),
              ...(isSidebarOpened ? [] : [classes.linkTextHidden]),
            ].join(" "),
          }}
          primary={label}
        />
      </ListItem>
    );
  }

  return (
    <>
      <ListItem
        button
        component={link && Link}
        onClick={toggleCollapse}
        className={classes.link}
        to={link}
        disableRipple
      >
        <ListItemIcon
          className={[
            classes.linkIcon,
            ...(isLinkActive ? [classes.linkIconActive] : []),
          ].join(" ")}
        >
          {icon || <InboxIcon />}
        </ListItemIcon>
        <ListItemText
          classes={{
            primary: [
              classes.linkText,
              ...(isLinkActive ? [classes.linkTextActive] : []),
              ...(isSidebarOpened ? [] : [classes.linkTextHidden]),
            ].join(" "),
          }}
          primary={label}
        />
      </ListItem>
      {children && (
        <Collapse
          in={isOpen && isSidebarOpened}
          timeout="auto"
          unmountOnExit
          className={classes.nestedList}
        >
          <List component="div" disablePadding>
            {children.map((childrenLink) => (
              <SidebarLink
                key={childrenLink && childrenLink.link}
                location={location}
                isSidebarOpened={isSidebarOpened}
                classes={classes}
                nested
                {...childrenLink}
              />
            )
            )}
          </List>
        </Collapse>
      )}
    </>
  );
}
