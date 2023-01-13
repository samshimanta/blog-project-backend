import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from './models/user.entity';
import { User } from './models/user.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private authService: AuthService
    ) { }

    //create a user
    
    createUser(user: User): Observable<User> {
        //raw password shouldn't be used so hashed them
        return this.authService.hashPasswords(user.password).pipe(
            //then we create a new user where we save the hashPassword to user object
            switchMap((passwordHash: string) => {
                const newUser = new UserEntity()
                newUser.name = user.name
                newUser.username = user.username
                newUser.email = user.email
                newUser.password = passwordHash
            //save the newUser with hash password to db
                return from(this.userRepository.save(newUser)).pipe(
            //remove the password from the user object so it isn,t leaked into the whole application
                    map((user: User) => {
                        const { password, ...result } = user;
                        return result;
                    }),
                    //if anything goes wrong we throw an error
    // catchError: Catches errors on the observable to be handled by returning a new observable or throwing an error.
    //here we are throwing an error
                    catchError(err => { throw new Error(`Invalid User: ${err}`) })
                )
            })
        )
        // return from(this.userRepository.save(user))
    }

    //find a specific user with id
    //remove the password from user object
    findUser(id: number): Observable<User> {
        return from(this.userRepository.findOneBy({ id })).pipe(
            
            map((user: User) => {
                const { password, ...result } = user;
                return result;
            })
        )
    }

    //find all users
    //remove the password from user object from users array
    findAllUsers(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users:User[])=>{
                users.forEach( user => delete user.password )
                return users;
            })
        )
    }

    // delete a user with id
    deleteUser(id: number): Observable<any> {
        return from(this.userRepository.delete(id))
    }

    //update a user info
    // email and password shouldn't be updated from here
    updateUser(id: number, user: User): Observable<any> {
        delete user.email;
        delete user.password;
        
        return from(this.userRepository.update(id, user))
    }

    //login user with email and password and after successfull login return jwt token
    login(user:User):Observable<string>{
        return this.validateUser(user.email,user.password).pipe(
            switchMap((user:User)=>{
                // if user foung return jwt
                if(user){
                    return this.authService.generateJwt(user).pipe(
                        map((jwt:string)=> jwt)
                    )
                } else {
                    return 'wrong credentials'
                }
            })
        )
    }

    //validate user credentials
    validateUser(email:string,password:string):Observable<User>{
        return this.findByMail(email).pipe(
            switchMap((user:User)=> this.authService.comparePasswords(password,user.password).pipe(
                map((match:boolean)=>{
                    if(match){
                        const {password, ...result} = user
                        return result
                    } else {
                        throw new Error('password not matched')
                    }
                })
            ))
        )
    }

    //find the user object by the email
    findByMail(email:string):Observable<User>{
        return from(this.userRepository.findOneBy({email}))
    }
}
