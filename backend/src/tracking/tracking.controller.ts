import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Get(':orderId')
  getStatus(@Param('orderId') orderId: string) {
    return this.trackingService.getStatus(orderId);
  }
}
