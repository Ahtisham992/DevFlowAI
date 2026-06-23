import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
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
    @Body()
    body: {
      conversationId?: string;
      message: string;
      model?: string;
      projectId?: string;
    },
    @Res() res: Response,
  ) {
    return this.aiService.streamChat(req.user.id, body, res);
  }

  @Post('analyze-code')
  async analyzeCode(@Body() body: { code: string; model?: string }) {
    return this.aiService.analyzeCode(body.code, body.model);
  }

  @Post('debug')
  async debugCode(
    @Body() body: { code: string; errorMessage: string; model?: string },
  ) {
    return this.aiService.debugCode(body.code, body.errorMessage, body.model);
  }

  @Post('generate-docs')
  async generateDocs(@Body() body: { code: string; model?: string }) {
    return this.aiService.generateDocs(body.code, body.model);
  }

  @Post('embeddings')
  async generateEmbeddings(@Body() body: { text: string; model?: string }) {
    return this.aiService.generateEmbeddings(body.text, body.model);
  }

  @Get('conversations')
  getConversations(@Req() req: RequestWithUser) {
    return this.aiService.getConversations(req.user.id);
  }

  @Get('projects/:projectId/conversation')
  getProjectConversation(
    @Req() req: RequestWithUser,
    @Param('projectId') projectId: string,
  ) {
    return this.aiService.getProjectConversation(projectId, req.user.id);
  }

  @Get('conversations/:id/messages')
  getMessages(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.aiService.getMessages(id, req.user.id);
  }

  @Delete('conversations/:id')
  deleteConversation(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.aiService.deleteConversation(id, req.user.id);
  }

  @Get('models')
  getModels() {
    return this.aiService.getModels();
  }
}
