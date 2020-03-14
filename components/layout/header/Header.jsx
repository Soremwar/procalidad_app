import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem
} from "@material-ui/core";
import {
  Menu as MenuIcon,
  Person as AccountIcon,
  ArrowBack as ArrowBackIcon
} from "@material-ui/icons";

import useStyles from "./styles.js";
import { Typography } from "../../common/Wrappers.jsx";

import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar
} from "../../context/Layout.jsx";

export default function Header(props) {
  const classes = useStyles();
  const layoutState = useLayoutState();
  const layoutDispatch = useLayoutDispatch();

  const [profileMenu, setProfileMenu] = useState(null);

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          color="inherit"
          onClick={() => toggleSidebar(layoutDispatch)}
          className={[
            classes.headerMenuButton,
            classes.headerMenuButtonCollapse
          ].join(" ")}
        >
          {layoutState.isSidebarOpened
            ? (
              <ArrowBackIcon
                classes={{
                  root: [classes.headerIcon, classes.headerIconCollapse].join(
                    " "
                  )
                }}
              />
            )
            : (
              <MenuIcon
                classes={{
                  root: [classes.headerIcon, classes.headerIconCollapse].join(
                    " "
                  )
                }}
              />
            )}
        </IconButton>
        <Typography variant="h6" weight="medium" className={classes.logotype}>
          {/*TODO Replace with real app name */}
          Procalidad App
        </Typography>
        <div className={classes.grow} />
        <IconButton
          aria-haspopup="true"
          color="inherit"
          className={classes.headerMenuButton}
          aria-controls="profile-menu"
          onClick={e => setProfileMenu(e.currentTarget)}
        >
          <AccountIcon classes={{ root: classes.headerIcon }} />
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
              John Smith
            </Typography>
            <Typography
              className={classes.profileMenuLink}
              component="a"
              color="primary"
              href="https://flatlogic.com"
            >
              Flalogic.com
            </Typography>
          </div>
          <MenuItem
            className={[classes.profileMenuItem, classes.headerMenuItem].join(
              " "
            )}
          >
            <AccountIcon className={classes.profileMenuIcon} /> Profile
          </MenuItem>
          <MenuItem
            className={[classes.profileMenuItem, classes.headerMenuItem].join(
              " "
            )}
          >
            <AccountIcon className={classes.profileMenuIcon} /> Tasks
          </MenuItem>
          <MenuItem
            className={[classes.profileMenuItem, classes.headerMenuItem].join(
              " "
            )}
          >
            <AccountIcon className={classes.profileMenuIcon} /> Messages
          </MenuItem>
          <div className={classes.profileMenuUser}>
            <Typography
              className={classes.profileMenuLink}
              color="primary"
              onClick={() => console.log("sign out user")}
            >
              Sign Out
            </Typography>
          </div>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
