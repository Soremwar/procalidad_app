import { RouteParams, RouterContext as BaseRouterContext } from "oak";
import { UserData } from "../lib/jwt.ts";

export interface State {
  user: UserData;
}

export type RouterContext<
  T extends Record<string | number, string | undefined> = RouteParams,
> = BaseRouterContext<T, State>;
