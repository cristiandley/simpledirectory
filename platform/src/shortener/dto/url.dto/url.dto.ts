import { IsUrl, IsString, IsOptional } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @IsString()
  @IsOptional()
  customSlug?: string;
}

export class UpdateUrlDto {
  @IsString()
  slug: string;
}