import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommonService } from './common.service';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('')
  getDashboard() {
    return this.commonService.fillDataForSales();
  }

  @Post('range')
  getDashboardByDateRange(
    @Body() dateRange: { startDate: string; endDate: string },
  ) {
    return this.commonService.getDashboardByDateRange(
      dateRange.startDate,
      dateRange.endDate,
    );
  }
}
