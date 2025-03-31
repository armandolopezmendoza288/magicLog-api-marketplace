import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<{ id: string, email: string, role: string } | null> {
        const userFromDb = await this.usersService.user({ email });
        const isValid = await bcrypt.compare(pass, userFromDb?.password || '');
        if (userFromDb && isValid) {
            const { id, email, role } = userFromDb;
            return { id, email, role };
        }
        return null;
    }

    async login(user: { id: string, email: string }) {
        const payload = { username: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async hashPassword(password: string) {
        return await bcrypt.hash(password, 10);
    }
}
