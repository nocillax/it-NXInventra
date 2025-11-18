import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('ticket')
  @UseGuards(JwtAuthGuard)
  async createTicket(@Body() dto: CreateTicketDto, @GetUser() user) {
    return this.supportService.createTicket(dto, user);
  }
}
