import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import cacheService from "../services/cache.service";
import { UserService } from "../services/user.service";
import { CryptoService } from "../services/crypto.service";
import { envConfig } from "../config/config";
import { AuthService } from "../services/auth.service";
import { DataLog, IUser } from "../interface";

// Extend the Express Request type to include a user property
export interface UserEx extends IUser {
  guest: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserEx;
    }
  }
}

class AuthMiddleware {
  private userService: UserService;
  private cryptoService: CryptoService;
  private authService: AuthService;

  constructor(userService: UserService, cryptoService: CryptoService, authService: AuthService) {
    this.userService = userService;
    this.cryptoService = cryptoService;
    this.authService = authService;

    this.validateUserOnly = this.validateUserOnly.bind(this);
    this.validateMulti = this.validateMulti.bind(this);
  }

  /**  Validate User เท่านั้น */
  public async validateUserOnly(req: Request, res: Response, next: NextFunction): Promise<any>  {
    try {
      const user = await this.authenticateUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authorization failed!",
          error: "User authentication required",
        });
      }

      req.user = { ...user, guest: false };
      next();
    } catch (error) {
      console.error("[ERROR] validateUserOnly:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  /**  Validate Multi (User + Guest) */
  public async validateMulti(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      let user = await this.authenticateGuest(req);
      if (!user) {
        user = await this.authenticateUser(req);
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "Authorization failed!",
            error: "User or Guest authentication required",
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("[ERROR] validateMulti:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  /**  Authenticate Guest */
  private async authenticateGuest(req: Request): Promise<UserEx | null> {
    try {
      const token = this.extractToken(req);
      if (!token) return null;

      const decode = this.cryptoService.decodeToken(token);
      if (!decode || !decode.guest) return null;

      if (decode.service !== envConfig.app.serviceName) {
        return null;
      };

      const isValidGuest = this.cryptoService.verifyAccessTokenGuest(token, envConfig.app.serviceName);
      if (!isValidGuest) return null;

      let user = await cacheService.get<UserEx>(`guest:${decode.sub}`);

      if (!user) {
        const userDatabase = await this.userService.getGuestUserById(decode.sub);
        if (!userDatabase) return null;

        user = {
          ...userDatabase,
          firstName: userDatabase.name,
          lastName: userDatabase.name,
          id: userDatabase.id,
          guest: true,
          email: `${userDatabase.name}@${envConfig.app.serviceName}.bsospace.com`,
          avatar: "",
        };

        await cacheService.set(`guest:${decode.sub}`, user, 600);
      }

      return { ...user, guest: true };
    } catch (error) {
      console.error("[ERROR] authenticateGuest:", error);
      return null;
    }
  }

  /**  Authenticate User */
  private async authenticateUser(req: Request): Promise<UserEx | null> {
    try {
      const token = this.extractToken(req);
      if (!token) return null;

      const decode = this.cryptoService.decodeToken(token);
      if (!decode || decode.guest) return null;

      if (decode.service !== envConfig.app.serviceName) {
        return null;
      };

      // Verify the access token
      const jwtPayload: JwtPayload | null = this.cryptoService.verifyAccessTokenOpenId(
        token,
        decode.service
      );

      if (!jwtPayload || !jwtPayload.email || !jwtPayload.sub) return null;

      let user = await cacheService.get<IUser>(`users:${jwtPayload.email}`);
      
      const userProlife = await this.authService.profile(token);

      if (!user) {
        let userDatabase = await this.userService.getUserByEmail(jwtPayload.email);

        if (!userDatabase) {
          console.log("[INFO] Creating new user...");

          userDatabase = await this.userService.createUser({
            email: userProlife.data?.email || "",
            firstName: userProlife.data?.firstName || "",
            lastName: jwtPayload.lastName || "",
            avatar: userProlife.data?.image || "",
            dataLogs: [
              {
                action: "User Created",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: "system",
                meta: [],
              },
            ],
          });

          if (!userDatabase) {
            console.error("[ERROR] Failed to create user!");
            return null;
          }
        }

        user = {
          ...userDatabase,
          avatar: userDatabase.avatar || "",
        };

        await cacheService.set(`users:${jwtPayload.email}`, user, 600);
      }

      const formattedUser: UserEx = { ...user, guest: false };

      return formattedUser;
    } catch (error) {
      console.error("[ERROR] authenticateUser:", error);
      return null;
    }
  }

  /**  Extract Token */
  private extractToken(req: Request): string | null {
    const authHeader = req.headers?.authorization;
    
    return authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.accessToken || null;
  }
}

export default AuthMiddleware;
