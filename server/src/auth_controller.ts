import jwt from 'jsonwebtoken';
import User, { IUser } from "./models/User.js"; 
import bcrypt from 'bcryptjs';
import { Request, Response, Application } from 'express';
import dotenv from "dotenv";
dotenv.config();


function isValidUsername(username: unknown): username is string {
    return typeof username === "string" && username.length > 0 && username.length <= 16;
}

function isValidPassword(password: unknown): password is string {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,16}$/;
    return typeof password === "string" && passwordRegex.test(password);
}

/**
 * @async
 * @function createUser
 * @summary Registers a new user if the username is available and the password meets security criteria.
 * @param {import('express').Request} req - Express request object containing `username` and `password` in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {void} Responds with JSON indicating success or failure.
 * @throws Will respond with 400 if validation fails or user exists.
 * 
 * Password must be 8-16 characters, include at least one uppercase letter and one number.
 * 
 * @example
 * // POST /signup
 * {
 *   "username": "Alice",
 *   "password": "Password1"
 * }
 */
export async function createUser(req: Request, res: Response): Promise<any> {
    // Obtain parameters from the request body
    const { username, password } = req.body;
    //ChatServer.debug(`Creating user: '${username}'...`);

    if (!isValidUsername(username)) {
        //ChatServer.debug(`Invalid username: '${username}'`);
        return res.status(400).json({ message: 'Username must be a string and less than 16 characters long!' });
    }

    if (!isValidPassword(password)) {
        //ChatServer.debug(`Invalid password for user: '${username}'`);
        return res.status(400).json({ message: 'Password must be 8-16 characters and include at least one uppercase letter and one number.' });
    }

    try {
        // Check if the user already exists in the database model
        const user = await User.findOne({ username });
        if (user) {
            //ChatServer.debug(`User '${username}' already exists`);
            return res.status(400).json({ message: 'User already exists.' });
        }

        // If the user does not exist, hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        //ChatServer.debug(`User '${username}' created successfully`);
        res.status(201).json({message: 'User created successfully'});

    } catch (err) {
        const error = err as Error;
        //ChatServer.debug(`Error creating the user: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
}


/**
* Logs in the user if their hashed password matches the user. A JWT token is generated and sent back to the client.
* This function is called when the user submits the login form.
* 
* @param {object} req - The request object from the client (an object containing the cleartext username and password).
* @param {object} res - The Server's response to the client (an object containing the JWT with expiry).
*/
export async function loginUser(req: Request, res: Response): Promise<any> {
    const { username, password } = req.body;
    //ChatServer.debug(`Logging in user: '${username}'...`);

    // Validate input before querying the database
    if (!isValidUsername(username) || !isValidPassword(password)) {
        //ChatServer.debug(`Invalid login attempt for username: '${username}'`);
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    try {
        // Find the user in the database model and return an error if not found
        const user = await User.findOne({ username });   
        if (!user) {
            //ChatServer.debug(`User '${username}' not found`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            //ChatServer.debug(`Invalid password for user '${username}'`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        // If the username and password match, proceed with login and send 
        //ChatServer.debug(`User '${username}' logged in successfully`);
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            return res.status(500).json({ message: 'Server configuration error: SECRET_KEY is not set.' });
        }
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            secretKey,
            { expiresIn: '15m' }
        );
        res.status(200).json({ token });

        //ChatServer.USERS.set(username, token);

    } catch (err) {
        const error = err as Error;
        //ChatServer.debug(`Error logging the user in: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
}


/**
* Verifies if the username is available. This function is called when the user types in the username input field.
* 
* @param {object} req - The request object from the client (containing the current inputted username).
* @param {object} res - The Server's response to the client (code and related status message).
*/
export async function checkUsername(req: Request, res: Response): Promise<any> {
    const { username } = req.body;
    //ChatServer.debug(`Checking availability for username: '${username}'`);

    // Validate input before querying the database
    if (!isValidUsername(username)) {
        //ChatServer.debug(`Username not currently found: '${username}'`);
        return res.status(400).json({ message: 'Invalid username' });
    }

    try {
        // Query the user in the database model
        const user = await User.findOne({ username }); 
        if (user) {
            //ChatServer.debug(`User '${username}' already exists`);
            return res.status(400).json({ message: 'Username already taken' });
        }
        // If no user found, return success
        //ChatServer.debug(`User '${username}' is available`);
        res.status(200).json({ message: 'Username is available' });

    } catch (err) {
        const error = err as Error;
        //ChatServer.debug(`Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
}


export async function uploadUserPhoto(req: Request, res: Response): Promise<any> {
    const { username, password } = req.body;
    //ChatServer.debug(`Logging in user: '${username}'...`);

    try {
        // Find the user in the database model
        const user = await User.findOne({ username });
    
        // If no user found, return an error
        if (!user) {
            //ChatServer.debug(`User '${username}' not found`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            //ChatServer.debug(`Invalid password for user '${username}'`);
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        // If the username and password match, proceed with login and send 
        //ChatServer.debug(`User '${username}' logged in successfully`);
        //ChatServer.debug(ChatServer.SECRET_KEY);
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            return res.status(500).json({ message: 'Server configuration error: SECRET_KEY is not set.' });
        }
        const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '1m' });
        res.status(200).json({ token });

        // No duplicate userames are allowed
        //ChatServer.USERS.set(username, token);

    } catch (err) {
        const error = err as Error;
        //ChatServer.debug(`Error logging the user in: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
}
