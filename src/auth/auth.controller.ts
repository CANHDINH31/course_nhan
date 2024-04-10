import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterForChildDto } from './dto/register-for-child.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/register-for-child')
  registerForChild(
    @Req() req,
    @Body() registerForChildDto: RegisterForChildDto,
  ) {
    return this.authService.registerForChild(req?.user, registerForChildDto);
  }

  @Post('/login')
  login(@Body() loginDtoDto: LoginDto) {
    return this.authService.login(loginDtoDto);
  }
}
