import express from 'express'
import{createUserWithEmailAndPassword , loginUserWithEmailAndPassword } from '../controllers/authController.js';

export function createAuthRoutes(){
const router = express.Router();


router.post('/createUserWithEmailAndPassword' , createUserWithEmailAndPassword)

router.post('/loginUserWithEmailAndPassword',loginUserWithEmailAndPassword)

return router ;

}