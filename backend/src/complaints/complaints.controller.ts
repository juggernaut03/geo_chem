import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ComplaintsService, CreateComplaintDto } from './complaints.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  @Post()
  create(@Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(dto);
  }

  @Get(':ticketId')
  findOne(@Param('ticketId') ticketId: string) {
    return this.complaintsService.findById(ticketId);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.complaintsService.findByOrder(orderId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':ticketId/status')
  updateStatus(@Param('ticketId') ticketId: string, @Body() body: { status: string; resolution?: string }) {
    return this.complaintsService.updateStatus(ticketId, body.status, body.resolution);
  }
}
