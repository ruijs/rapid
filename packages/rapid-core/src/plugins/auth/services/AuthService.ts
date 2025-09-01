import { IRpdServer } from "~/core/server";
import { createJwt } from "~/utilities/jwtUtility";

export type AuthServiceOptions = {
  jwtKey: string;
  userEntitySingularCode?: string;
  profilePropertyCodes?: string[];
};

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
  #userEntitySingularCode?: string;
  #profilePropertyCodes?: string[];

  constructor(server: IRpdServer, options: AuthServiceOptions) {
    this.#server = server;
    this.#jwtKey = options.jwtKey;
    this.#userEntitySingularCode = options.userEntitySingularCode;
    this.#profilePropertyCodes = options.profilePropertyCodes;
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

  async getProfileOfUser(userId: number) {
    const userEntitySingularCode = this.#userEntitySingularCode || "oc_user";
    const profilePropertyCodes = this.#profilePropertyCodes || ["id", "name", "login", "email", "department", "roles", "state", "createdAt"];
    const entityManager = this.#server.getEntityManager(userEntitySingularCode);
    const user = await entityManager.findEntity({
      filters: [
        {
          operator: "eq",
          field: "id",
          value: userId,
        },
      ],
      properties: profilePropertyCodes,
    });
    return user;
  }
}
