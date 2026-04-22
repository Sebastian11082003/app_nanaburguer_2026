import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================
  // REGISTER
  // ============================
  @Post('register')
  register(@Body() dto: RegisterDto, @Tenant() restaurantId: string) {
    return this.authService.register(dto, restaurantId);
  }

  // ============================
  // LOGIN
  // ============================
  @Post('login')
  login(@Body() dto: LoginDto, @Tenant() restaurantId: string) {
    return this.authService.login(dto.email, dto.password, restaurantId);
  }
}
