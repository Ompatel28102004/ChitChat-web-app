import { compare, hash } from 'bcrypt';
import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose"
const maxAge = 3 * 24 * 60 * 60; // in seconds
const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

// Set cookie options
// const cookieOptions = {
//     maxAge: maxAge * 1000,  // maxAge is in milliseconds for cookies
//     httpOnly: true,         // Helps prevent client-side JavaScript from accessing the token
//     secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production (HTTPS)
//     sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',  // Allow cross-site cookies in production
// };
const cookieOptions = {
    maxAge: maxAge * 1000,  // maxAge is in milliseconds for cookies
    httpOnly: true,
    secure: true,  // Set to false if using localhost (but must be true for HTTPS)
    sameSite: "None", // Required for cross-origin requests
};

export const signup = async (request, response, next) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).send("Email and Password are required.");
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).send("User with this email already exists.");
        }

        // Hash the password before saving it to the database
        const hashedPassword = await hash(password, 10);
        const user = await User.create({ email, password: hashedPassword });

        // Create a JWT token and set it in a cookie
        const token = createToken(email, user.id);
        response.cookie("jwt", token, cookieOptions);

        return response.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            }
        });
    } catch (error) {
        console.error("Error during signup:", error);
        return response.status(500).send("Internal Server Error");
    }
};

export const login = async (request, response, next) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).send("Email and Password are required.");
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return response.status(404).send("User with given email not found.");
        }

        const auth = await compare(password, user.password);
        if (!auth) {
            return response.status(400).send("Password is incorrect.");
        }

        // Set cookie after successful login
        const token = createToken(email, user.id);
        response.cookie("jwt", token, cookieOptions);

        return response.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        return response.status(500).send("Internal Server Error");
    }
};

export const getUserInfo = async (request, response, next) => {
    try {
        const userData = await User.findById(request.userId);
        if (!userData) {
            return response.status(404).send("User with given ID not found.");
        }

        return response.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    } catch (error) {
        console.error("Error during fetching user info:", error);
        return response.status(500).send("Internal Server Error");
    }
};

export const updateProfile = async (request, response, next) => {
    try {
        const userId = request.userId; // Retrieved from token middleware
        const { firstName, lastName } = request.body;

        if (!firstName || !lastName) {
            return response.status(400).send("First Name and Last Name are required.");
        }

        // Log incoming data for debugging
        console.log("Incoming data:", { firstName, lastName }, "User ID:", userId);

        // Ensure userId is valid (check for token validation issues)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).send("Invalid User ID.");
        }

        // Set the default color to be the same for all users
        const defaultColor = "#ff006e"; // Example default color

        // Update user profile and set profileSetup to true
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, color: defaultColor, profileSetup: true }, // Make sure lastName is updated here
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedUser) {
            console.log("User not found for ID:", userId);
            return response.status(404).send("User with the given ID not found.");
        }

        console.log("Profile successfully updated for user:", updatedUser);

        // Send back updated profile data
        return response.status(200).json({
            id: updatedUser._id,
            email: updatedUser.email,
            profileSetup: updatedUser.profileSetup,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName, // Return lastName in response
            image: updatedUser.image,
            color: updatedUser.color,
        });
    } catch (error) {
        console.error("Error during profile update:", error);
        return response.status(500).send("Internal Server Error");
    }
};


export const logout = async (request, response, next) => {
    try {
        // Clear the JWT cookie by setting it with an empty value and a short maxAge
        response.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "none" });
        
        // Send a successful logout response
        return response.status(200).send("Logout Successful");
      } catch (error) {
        console.error("Error during logout:", error);
        return response.status(500).send("Internal Server Error");
      }
};


        


// export const addProfileImage = async (request, response, next) => {
//     try {
//         // Extract userId from request.userId set by the verifyToken middleware
//         const userId = request.userId; // This is better than taking from params or body
//         const { firstName, lastName, color } = request.body;

//         // Validate required fields
//         if (!firstName || !lastName || !color) {
//             return response.status(400).send("First Name, Last Name, and Color are required.");
//         }

//         // Ensure userId is valid (optional since you're getting from verified token)
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return response.status(400).send("Invalid User ID.");
//         }

//         // Update the user profile
//         const updatedUser = await User.findByIdAndUpdate(
//             userId, // Use the verified userId directly
//             { firstName, lastName, color, profileSetup: true }, // Update fields
//             { new: true, runValidators: true } // Return the updated document
//         );

//         // If no user found, return 404
//         if (!updatedUser) {
//             return response.status(404).send("User with given ID not found.");
//         }

//         // Return updated user data
//         return response.status(200).json({
//             id: updatedUser._id,
//             email: updatedUser.email,
//             profileSetup: updatedUser.profileSetup,
//             firstName: updatedUser.firstName,
//             lastName: updatedUser.lastName,
//             image: updatedUser.image,
//             color: updatedUser.color,
//         });
//     } catch (error) {
//         console.error("Error during profile update:", error); // Log the error details
//         return response.status(500).send("Internal Server Error");
//     }
// };
