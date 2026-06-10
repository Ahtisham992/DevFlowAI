import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

interface RequestWithUser extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat/stream')
  async chatStream(
    @Req() req: RequestWithUser,
    @Body() body: { conversationId?: string; message: string; model?: string },
    @Res() res: Response,
  ) {
    return this.aiService.streamChat(req.user.id, body, res);
  }

  @Get('conversations')
  getConversations(@Req() req: RequestWithUser) {
    return this.aiService.getConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  getMessages(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.aiService.getMessages(id, req.user.id);
  }
}
