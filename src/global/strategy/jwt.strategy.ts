import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { StrategyOptions } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { RedisService } from 'src/db/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 这里的 Strategy 必须是 passport-jwt 包中的
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET') ?? 'secret',
      passReqToCallback: true,
    } as StrategyOptions);
  }

  async validate(req: Request, payload: User) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const existUser = await this.userRepository.findOne({
      where: { id: payload.id },
    });

    const cacheToken = await this.redisService.get(`token_${existUser.id}`);
    if (!cacheToken) throw new UnauthorizedException('token已过期');
    if (cacheToken !== token) throw new UnauthorizedException('token不正确');
    if (!existUser) throw new UnauthorizedException('token验证失败');

    await this.redisService.set(
      `token_${existUser.id}`,
      token,
      this.configService.get('JWT_EXPIRES_IN'),
    );

    return existUser;
  }
}
