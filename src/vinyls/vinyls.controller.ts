import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VinylsService } from './vinyls.service';
import { VinylDto } from './dto/vinyl.dto';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtWhiteGuard } from 'src/auth/guards/jwtWhiteList/jwtWhite.guard';
import { RoleGuard } from 'src/auth/guards/role/role.guard';
import { Request } from 'supertest';
import { QueryParams } from 'src/types';

@Controller('vinyls')
export class VinylsController {
  constructor(private vinylsService: VinylsService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async createVinyl(@Body() vinylDto: VinylDto) {
    return this.vinylsService.createVinyl(vinylDto);
  }

  @Get()
  async getVinyls(@Req() req: Request, @Query() query: QueryParams) {
    //TODO: ADD ALL NEED INFO
    return this.vinylsService.getAllVinyls(req, query);
  }

  @Patch('/update')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async updateVinyl(@Body() updateVinylDto: UpdateVinylDto) {
    return this.vinylsService.updateVinyl(updateVinylDto);
  }

  @Delete('/delete')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async deleteVinyl(@Body() id: { _id: string }) {
    return this.vinylsService.deleteVinyl(id);
  }

  @Get('/bue')
  async bueVinyls(
    @Req() req: Request,
    @Query() query: { userId: string; vinylId: string },
  ) {
    return this.vinylsService.bueVinyl(req, query);
  }

  @Get('/getVinyl')
  async getVinyl(@Query() query: { userId: string; vinylId: string }) {
    return this.vinylsService.getVinyl(query);
  }
}
