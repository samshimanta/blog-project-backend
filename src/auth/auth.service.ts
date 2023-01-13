import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from, of } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService:JwtService
    ){}

    generateJwt(user:User):Observable<string>{
        return from(this.jwtService.signAsync(user))
    }

    hashPasswords(password:string):Observable<string>{
        return from<string>(bcrypt.hash(password,12))
    }

    comparePasswords(newPassword,hashedPassword):Observable<any|boolean>{
        return of<any|boolean>(bcrypt.compare(newPassword,hashedPassword))
    }
}
