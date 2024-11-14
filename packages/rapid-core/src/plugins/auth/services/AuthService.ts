import { IRpdServer } from "~/core/server";
import { createJwt } from "~/utilities/jwtUtility";

export interface UserAccessToken {
  sub: "userAccessToken";
  aud: string;
}

export interface CreateUserAccessTokenOptions {
  issuer: string;
  userId: number;
  userLogin: string;
}

export default class AuthService {
  #server: IRpdServer;
  #jwtKey: string;

  constructor(server: IRpdServer, jwtKey: string) {
    this.#server = server;
    this.#jwtKey = jwtKey;
  }

  createUserAccessToken(options: CreateUserAccessTokenOptions): string {
    const secretKey = Buffer.from(this.#jwtKey, "base64");
    const token = createJwt(
      {
        iss: options.issuer,
        sub: "userAccessToken",
        aud: "" + options.userId,
        iat: Math.floor(Date.now() / 1000),
        act: options.userLogin,
      } as UserAccessToken,
      secretKey,
    );

    return token;
  }
}
