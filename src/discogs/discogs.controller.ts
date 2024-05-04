import { Controller, Get, Query } from '@nestjs/common';
import { DiscogsService } from './discogs.service';

@Controller('discogs')
export class DiscogsController {
  constructor(private discogsService: DiscogsService) {}
  @Get('records')
  getRecords(@Query() query: { name: string }) {
    return this.discogsService.getRecords(query);
  }

  @Get('record')
  getRecord(@Query() query: { id: string }) {
    return this.discogsService.getRecord(query);
  }
}
