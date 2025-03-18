import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import cacheService from "../services/cache.service";
import { UserService } from "../services/user.service";
import { CryptoService } from "../services/crypto.service";
import { envConfig } from "../config/config";
import { AuthService } from "../services/auth.service";
import { User, UserType } from "@prisma/client";

// Extend Express Request Type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

class AuthMiddleware {
  constructor(
    private userService: UserService,
    private cryptoService: CryptoService,
    private authService: AuthService
  ) {}

  /**  Validate สำหรับ User เท่านั้น */
  public validateUserOnly = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const user = await this.authenticate(req, UserType.NORMAL);
      if (!user) {
        return this.unauthorizedResponse(res, "User authentication required");
      }
      req.user = user;
      next();
    } catch (error) {
      this.internalServerError(res, error, "validateUserOnly");
    }
  };

  /**  Validate ได้ทั้ง User และ Guest */
  public validateMulti = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const user = await this.authenticate(req, UserType.GUEST) || await this.authenticate(req, UserType.NORMAL);
      if (!user) {
        return this.unauthorizedResponse(res, "User or Guest authentication required");
      }
      req.user = user;
      next();
    } catch (error) {
      this.internalServerError(res, error, "validateMulti");
    }
  };

  /**  ฟังก์ชัน Authenticate สำหรับ User และ Guest */
  private async authenticate(req: Request, type: UserType): Promise<User | null> {
    try {
      const token = this.extractToken(req);
      if (!token) return null;

      const decode = this.cryptoService.decodeToken(token);
      if (!decode || decode.service !== envConfig.app.serviceName) {
        return null;
      }
      
      return type === UserType.GUEST ? this.authenticateGuest(decode.sub, token) : this.authenticateUser(token);
    } catch (error) {
      console.error("[ERROR] authenticate:", error);
      return null;
    }
  }

  /**  Authenticate Guest */
  private async authenticateGuest(guestId: string, token: string): Promise<User | null> {
    try {
      if (!this.cryptoService.verifyAccessTokenGuest(token, envConfig.app.serviceName)) return null;

      let user = await cacheService.get<User>(`guest:${guestId}`);
      if (!user) {
        user = await this.userService.getUserById(guestId);
        if (!user) return null;

        await cacheService.set(`guest:${guestId}`, user, 600);
      }

      return user;
    } catch (error) {
      console.error("[ERROR] authenticateGuest:", error);
      return null;
    }
  }

  /**  Authenticate User */
  private async authenticateUser(token: string): Promise<User | null> {
    try {
      const jwtPayload = this.cryptoService.verifyAccessTokenOpenId(token, envConfig.app.serviceName);
      if (!jwtPayload || !jwtPayload.email) return null;

      let user = await cacheService.get<User>(`users:${jwtPayload.email}`);
      if (!user) {
        user = await this.userService.getUserByEmail(jwtPayload.email) || await this.createNewUser(token);
        if (!user) return null;

        await cacheService.set(`users:${jwtPayload.email}`, user, 600);
      }

      return user;
    } catch (error) {
      console.error("[ERROR] authenticateUser:", error);
      return null;
    }
  }

  /**  สร้าง User ใหม่ ถ้ายังไม่มีในระบบ */
  private async createNewUser(token: string): Promise<User | null> {
    try {
      console.log("[INFO] Creating new user...");
      const userProfile = await this.authService.profile(token);
      if (!userProfile.success || !userProfile.data) {
        console.error("[ERROR] Invalid user profile");
        return null;
      }

      const user: Partial<User> = {
        email: userProfile.data.email,
        avatar: userProfile.data.image,
        firstName: userProfile.data.username,
        lastName: userProfile.data.username,
        type: UserType.NORMAL,
        key: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await this.userService.createUser(user);
    } catch (error) {
      console.error("[ERROR] createNewUser:", error);
      return null;
    }
  }

  /**  Extract Token จาก Header หรือ Cookies */
  private extractToken(req: Request): string | null {
    return req.headers.authorization?.startsWith("Bearer ") 
      ? req.headers.authorization.split(" ")[1] 
      : req.cookies?.accessToken || null;
  }

  /**  Unauthorized Response */
  private unauthorizedResponse(res: Response, message: string): Response {
    return res.status(401).json({ success: false, message: "Authorization failed!", error: message });
  }

  /**  Internal Server Error Handler */
  private internalServerError(res: Response, error: any, methodName: string): Response {
    console.error(`[ERROR] ${methodName}:`, error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export default AuthMiddleware;
