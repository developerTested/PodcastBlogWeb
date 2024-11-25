import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Check token in cookies or Authorization header (Bearer token)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check if the user exists in the database using the decoded token's user ID
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid or expired token");
        }

        // Attach the user object to the request for further use in other routes
        req.user = user;
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        // Handle errors: Unauthorized if there's an issue with the token
        throw new ApiError(401, error.message || "Invalid access token or token expired");
    }
});