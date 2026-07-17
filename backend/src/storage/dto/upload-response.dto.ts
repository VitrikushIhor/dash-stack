import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description:
      'Storage key — store this in your database, NOT the URL. Example: avatars/550e8400-e29b.webp',
    example: 'avatars/550e8400-e29b-41d4-a716-446655440000.webp',
  })
  key: string;

  @ApiProperty({
    description:
      'Public CDN URL for display. Do NOT store in DB — derive from key via storageService.getPublicUrl()',
    example:
      'https://d1234abcdef.cloudfront.net/avatars/550e8400-e29b-41d4-a716-446655440000.webp',
  })
  url: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 45320,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type of the stored file',
    example: 'image/webp',
  })
  mimeType: string;
}
