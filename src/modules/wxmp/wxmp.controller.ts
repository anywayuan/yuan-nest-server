import { Body, Controller, Get, Post } from '@nestjs/common';
import { WxmpService } from './wxmp.service';
import { Public } from 'src/global/decorator/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAllAlbumResDto } from './dto/get-album.dto';
import { GetPhotosResDto } from './dto/get-photos.dto';
import { GetPhotosReqDto } from './dto/get-photos.dto';

@ApiTags('wxmp')
@Controller('wxmp')
export class WxmpController {
  constructor(private readonly wxmpService: WxmpService) {}

  @Get('albums')
  @Public()
  @ApiOperation({ summary: '图片分类' })
  @ApiResponse({ status: 200, description: 'success', type: GetAllAlbumResDto })
  async getAlbumList() {
    return await this.wxmpService.getAlbumList();
  }

  @Post('photos')
  @Public()
  @ApiOperation({ summary: '根据分类获取' })
  @ApiResponse({ status: 200, description: 'success', type: GetPhotosResDto })
  async getPhotosByAlbum(@Body() body: GetPhotosReqDto) {
    return await this.wxmpService.getPhotosByAlbum(body);
  }
}
