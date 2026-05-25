import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import {randomBytes , createHmac} from 'node:crypto'
import { usersTable } from '../db/schema.js';
import jwt from 'jsonwebtoken';

class userAuthService{
     async getUserByEmail(email){
        const existing =  await db.select().from(usersTable).where(eq(usersTable.email , email))
            if(!existing || existing.length === 0 )  return null
            return existing[0]
    }

     SECRET_KEY  = process.env.SECRET_KEY ;


async createUserWithEmailAndPasswordService({fullName , email , password }){
    //check user already exist
    
    const existing =  await this.getUserByEmail(email) ;

    if(existing) throw new Error('User with this email already exist');

    const salt = randomBytes(16).toString('hex') ; 

    const hash  = createHmac('sha256', salt).update(password).digest('hex')

    //inserting data into db

    const userInsertResult = await db.insert(usersTable).values({fullName : fullName , email:email , password : hash , salt : salt}).returning()

    if(!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0].id) throw new Error("Something went wrong") ; 

    const token = jwt.sign({id: userInsertResult[0].id} , this.SECRET_KEY  , {expiresIn: '7d'})
    return {
  token,
  user: {
    id: userInsertResult[0].id,
    fullName: userInsertResult[0].fullName,
    email: userInsertResult[0].email
  }
}
}


async loginUserWithEmailAndPasswordService({email , password}){
    if(!email || !password) throw new Error(`incomple fields `);
     
    const user =  await this.getUserByEmail(email) ;

    if(!user) throw new Error('NO user  found');
    
    

    const hash  = createHmac('sha256', user.salt).update(password).digest('hex')

    if (hash !== user.password) {
        throw new Error('Incorrect email or password');
    }

   

    const token = jwt.sign({id: user.id} , this.SECRET_KEY  , {expiresIn: '7d'})
    return {
    token,
    user: {
    id: user.id,
    fullName: user.fullName,
    email: user.email
  }
}
}

   
}

export default  userAuthService