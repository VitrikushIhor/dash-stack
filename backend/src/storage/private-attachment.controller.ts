import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/presentation/guards/jwt-auth.guard';
import { UserEntity } from '../common/decorators/user.decorator';
import { StorageService } from './storage.service';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage/attachments')
export class PrivateAttachmentController {
  constructor(private readonly storageService: StorageService) {}

  @Get(':encodedKey')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async download(
    @Param('encodedKey') encodedKey: string,
    @UserEntity() user: { id: string },
  ): Promise<StreamableFile> {
    if (!/^[A-Za-z0-9_-]{1,512}$/.test(encodedKey)) {
      throw new NotFoundException('Attachment not found');
    }

    const key = Buffer.from(encodedKey, 'base64url').toString('utf8');
    if (
      Buffer.from(key).toString('base64url') !== encodedKey ||
      !/^files\/[A-Za-z0-9_-]+(?:\.[A-Za-z0-9]+)?$/.test(key)
    ) {
      throw new NotFoundException('Attachment not found');
    }

    const bytes = await this.storageService.readAttachment(key, user.id);
    return new StreamableFile(bytes, {
      type: 'application/octet-stream',
      disposition: `attachment; filename="${key.slice('files/'.length)}"`,
      length: bytes.length,
    });
  }
}
