import { create, getNumericDate, verify } from "djwt";
import { encryption_key } from "../config/api.js";

export const algorithm = "HS256";

export interface UserData {
  id: number;
  name: string;
  email: string;
  profiles: number[];
}

interface Payload {
  exp: number;
  iss: string;
  user: UserData;
}

/**
 * Creates new JWT token
 * Expiration date defaults to one month from now
 * @param expiration Milliseconds from now til the token is set to invalid. Defaults to one month
 */
export const createNewToken = (
  user_data: UserData,
  expiration = 30 * 24 * 60 * 60,
) =>
  create(
    {
      alg: algorithm,
      typ: "JWT",
    },
    {
      exp: getNumericDate(expiration),
      iss: "PROCALIDAD_APP",
      user: user_data,
      // deno-lint-ignore no-explicit-any
    } as any, // Cast needed cause token generation expects JSON like structure
    encryption_key,
  );

/**
 * Throws if token string is not valid, is expired, or does not match expected structure
 */
export const decodeToken = async (token_string: string): Promise<UserData> => {
  try {
    const payload = await verify(
      token_string,
      encryption_key,
      algorithm,
    ) as unknown as Payload;

    return payload.user;
  } catch (_e) {
    throw new Error(
      "La sesion proporcionada es invalida",
    );
  }
};
