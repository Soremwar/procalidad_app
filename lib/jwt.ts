import { makeJwt, setExpiration, Jose } from "djwt/create.ts";
import { validateJwt } from "djwt/validate.ts";
import {
  encryption_key,
} from "../config/api_deno.js";

export const algorithm = "HS256";

const jwt_params = {
  alg: algorithm,
  typ: "JWT",
} as Jose;

interface UserData {
  id: number;
  name: string;
  email: string;
  profiles: number[];
}

/*
* Creates new JWT token
* Expiration date defaults to one month, must be set through a numbre indicating seconds remaining for expiration
* */
export const createNewToken = async (
  user_data: UserData,
  expiration: number = 30 * 24 * 60 * 60,
): Promise<string> => {
  return makeJwt({
    key: encryption_key,
    header: jwt_params,
    payload: {
      exp: setExpiration(expiration),
      iss: "PROCALIDAD_APP",
      user: user_data as any,
    },
  });
};

/*
* Throws if token string is not valid, is expired, or does not match expected structure
* */
export const decodeToken = async (token_string: string): Promise<UserData> => {
  const token = await validateJwt({
    jwt: token_string,
    key: encryption_key,
    algorithm,
  });

  if (!token.isValid) {
    throw new Error(
      "La sesion proporcionada es invalida",
    );
  }

  //@ts-ignore
  return token.payload?.user as unknown as UserData;
};
