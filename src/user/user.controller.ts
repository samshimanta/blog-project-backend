import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { catchError, map, Observable, of } from 'rxjs';
import { User } from './models/user.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(
        private userService:UserService
    ){}

    //create a user 
    //if user found return user else the error object
    @Post()
    createUser(@Body() user:User ): Observable<User | Object>{
        return this.userService.createUser(user).pipe(
            map( (user:User)=> user ),
            catchError( (err) => of({error:err.message}) )
        )
    }

    //login with user credentials extracted from the body
    @Post('login')
    login(@Body() user:User):Observable<Object>{
        return this.userService.login(user).pipe(
            map((jwt:string)=> {return {access_token:jwt}})
        )
    }

    //find all users
    @Get()
    findAllUsers():Observable<User[]>{
        return this.userService.findAllUsers()
    }

    //find a user with id
    @Get(':id')
    FindUser(@Param()params):Observable<User>{
        console.log(params)
        return this.userService.findUser(params.id)
    }

    //delete a user
    @Delete(':id')
    deleteUser(@Param('id') id:string){
        return this.userService.deleteUser(Number(id))
    }
    

    //update a user
    //use the user id from param -- the id is in string from the param or url so convert it to number first
    //use body to get the user data
    @Put(':id')
    updateUser(@Param('id') id:string , @Body() user:User):Observable<User>{
        return this.userService.updateUser(Number(id),user)
    }

}





