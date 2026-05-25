import { db } from '../db/index.js';

import userAuthService from '../services/authService.js';


import { usersTable } from '../db/schema.js';


const AuthService = new userAuthService();

async function  createUserWithEmailAndPassword(req,res){
     try {

        const user = await AuthService.createUserWithEmailAndPasswordService(req.body);

        return res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

 async function loginUserWithEmailAndPassword(req,res){

    
   try {
         const loginUser = await AuthService.loginUserWithEmailAndPasswordService(req.body);
         return res.status(201).json({
            success: true,
            data: loginUser
        });
   } catch (error) { return res.status(400).json({
            success: false,
            message: error.message
        });
   }
}

export {createUserWithEmailAndPassword , loginUserWithEmailAndPassword}



