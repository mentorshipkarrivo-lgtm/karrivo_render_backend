import Jwt from "jsonwebtoken";
import helper from "../helper/helper.js";
import User from "../models/users.js";
export const Auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return helper.failed(res, "Auth Token is required");
    }
    token = token.split(" ")[1];

    Jwt.verify(token, process.env.JWT_SK, async (err, decode) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return helper.failed(
            res,
            "Token expired, please refresh the token",
            {},
            408
          );
        }
        return helper.failed(res, "Invalid Token");
      }
      let findUser = await User.findById(decode.id);
      if (!findUser) {
        return helper.failed(res, "Invalid User");
      }
      if (findUser.role == 1 && findUser.isVerified == 0) {
        return helper.failed(res, "User Not Verified", {
          email: findUser.email,
        });
      }

      if (findUser.role == 1 && findUser.isBlock == 1) {
        return helper.failed(
          res,
          "User has been blocked",
          {
            email: findUser.email,
          },
          401
        );
      }
      if (findUser.role == 1) {
        req.user = findUser;
      } else {
        req.admin = findUser;
      }
      next();
    });
  } catch (error) {
    next(error);
  }
};
export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.admin) {
      return helper.failed(res, "You Are Not Authorised", {}, 401);
    }
    next();
  } catch (error) {
    next(error);
  }
};
export const verifyUser = async (req, res, next) => {
  try {
    if (!req.user && !req.admin) {
      return helper.failed(res, "You Are Not Authorised", {}, 401);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyAccountant = async (req, res, next) => {
  try {
    if (!req.admin || req.admin.role !== 3) {
      return helper.failed(res, "You Are Not Authorised", {}, 401);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export /**
 * This method is used to check the permissions of the logged-in user
 * @param {*} permission
 * @return {*}
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const adminUserPermissions = req.admin.permissions || [];
      if (req.admin.role === 0) {
        return next();
      }

      if (
        (req.admin.role === 2 || req.admin.role === 3) &&
        !adminUserPermissions.includes(permission)
      ) {
        return helper.failed(
          res,
          `Access denied: User doesn't have ${permission} Permission`,
          {},
          403
        );
      }

      if (![0, 2, 3].includes(req.admin.role)) {
        return helper.failed(
          res,
          "Access denied: User doesn't have the required role or permissions",
          {},
          403
        );
      }

      next();
    } catch (error) {
      console.log(error);
      return helper.err(res, error, req.path);
    }
  };
};