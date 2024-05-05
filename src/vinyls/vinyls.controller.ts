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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VinylsService } from './vinyls.service';
import { VinylDto } from './dto/vinyl.dto';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtWhiteGuard } from 'src/auth/guards/jwtWhiteList/jwtWhite.guard';
import { RoleGuard } from 'src/auth/guards/role/role.guard';
import { Request } from 'supertest';
import { QueryParams } from 'src/types';
import { ObjectId } from 'mongodb';

@Controller('vinyls')
export class VinylsController {
  constructor(private vinylsService: VinylsService) {}

  @Post('/create')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async createVinyl(@Body() vinylDto: VinylDto) {
    return this.vinylsService.createVinyl(vinylDto);
  }

  @Post('/create/discog')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async createVinylFromDiscog(@Query() query: { recordId: string }) {
    return this.vinylsService.createVinylFromDiscog(query.recordId);
  }

  @Get()
  async getVinyls(@Req() req: Request, @Query() query: QueryParams) {
    return this.vinylsService.getAllVinyls(req, query);
  }

  @Patch('/update')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async updateVinyl(@Body() updateVinylDto: UpdateVinylDto) {
    return this.vinylsService.updateVinyl(updateVinylDto);
  }

  @Patch('/update/discogs')
  @UseGuards(JwtAuthGuard, JwtWhiteGuard, RoleGuard)
  async updateDiscogsVinyl(@Query() query: { id: ObjectId }) {
    return this.vinylsService.updateDiscogsVinyl(query.id);
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
