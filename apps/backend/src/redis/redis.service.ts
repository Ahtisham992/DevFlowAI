import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL');
    if (url) {
      this.client = new Redis(url);
    } else {
      this.client = new Redis({
        host: this.config.get<string>('REDIS_HOST') || 'localhost',
        port: this.config.get<number>('REDIS_PORT') || 6379,
      });
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
