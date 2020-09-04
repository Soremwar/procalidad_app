import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from "@material-ui/core";
import {
  Menu as MenuIcon,
  Person as AccountIcon,
  ArrowBack as ArrowBackIcon,
} from "@material-ui/icons";
import {
  Link,
} from "react-router-dom";

import useStyles from "./styles.js";
import { Typography } from "../../common/Wrappers.jsx";

import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/Layout.jsx";
import { UserContext, signOutUser } from "../../context/User.jsx";

export default function Header(props) {
  const classes = useStyles();
  const layoutState = useLayoutState();
  const layoutDispatch = useLayoutDispatch();
  const [userState, userDispatch] = useContext(UserContext);
  const [profileMenu, setProfileMenu] = useState(null);
  const [profile_source, setProfileSource] = useState("/api/usuario/foto");

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          color="inherit"
          onClick={() => toggleSidebar(layoutDispatch)}
          className={[
            classes.headerMenuButton,
            classes.headerMenuButtonCollapse,
          ].join(" ")}
        >
          {layoutState.isSidebarOpened
            ? (
              <ArrowBackIcon
                classes={{
                  root: [classes.headerIcon, classes.headerIconCollapse].join(
                    " ",
                  ),
                }}
              />
            )
            : (
              <MenuIcon
                classes={{
                  root: [classes.headerIcon, classes.headerIconCollapse].join(
                    " ",
                  ),
                }}
              />
            )}
        </IconButton>
        <img
          src="/resources/img/logo.png"
          style={{
            width: "auto",
            "maxHeight": "60px",
          }}
        />
        <div className={classes.grow} />
        <IconButton
          aria-haspopup="true"
          color="inherit"
          className={classes.headerMenuButton}
          aria-controls="profile-menu"
          onClick={(e) => setProfileMenu(e.currentTarget)}
        >
          <img
            style={{
              height: "60px",
              width: "60px",
              borderRadius: "30%",
            }}
            onError={() => setProfileSource("/resources/img/icon.png")}
            src={profile_source}
          />
        </IconButton>
        <Menu
          id="profile-menu"
          open={Boolean(profileMenu)}
          anchorEl={profileMenu}
          onClose={() => setProfileMenu(null)}
          className={classes.headerMenu}
          classes={{ paper: classes.profileMenu }}
          disableAutoFocusItem
        >
          <div className={classes.profileMenuUser}>
            <Typography variant="h4" weight="medium">
              {userState.name}
            </Typography>
            <Typography
              className={classes.profileMenuLink}
              component="a"
              color="primary"
            >
              {userState.email}
            </Typography>
          </div>
          <MenuItem
            className={[classes.profileMenuItem, classes.headerMenuItem].join(
              " ",
            )}
            component={Link}
            to="/usuario/perfil"
          >
            <AccountIcon className={classes.profileMenuIcon} />
            Datos personales
          </MenuItem>
          <div className={classes.profileMenuUser}>
            <Typography
              className={classes.profileMenuLink}
              color="primary"
              onClick={() => signOutUser(userDispatch, props.history)}
            >
              Cerrar Sesion
            </Typography>
          </div>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
