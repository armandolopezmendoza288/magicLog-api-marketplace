import { Body, ConflictException, Controller, Get, HttpCode, Post, Res, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService
    ) { }

    @UsePipes(new ValidationPipe())
    @Post('/login')
    @HttpCode(200)
    async login(@Body() userData) {
        const validatedUser = await this.authService.validateUser(
            userData.email,
            userData.password,
        );

        if (!validatedUser) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const { access_token } = await this.authService.login(validatedUser)
        return {
            access_token,
            ...validatedUser
        }
    }

    @Post('/signup')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async signupUser(@Body() userData: CreateUserDto) {
        const userExist = await this.userService.user({ email: userData.email });

        if (userExist) {
            throw new ConflictException('El usuario ya existe');
        }

        const { password: pass, ...user } = userData;
        const hashedPassword = await this.authService.hashPassword(pass);
        await this.userService.createUser({ password: hashedPassword, ...user });

        return { message: "Usuario creado con éxito" };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/protected')
    protected() {
        return {
            message: "Ruta protegida"
        }
    }
}
