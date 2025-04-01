import { IsUrl, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @IsString()
  @IsOptional()
  customSlug?: string;

  @IsString()
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email' })
  userId?: string;
}

export class UpdateUrlDto {
  @IsString()
  slug: string;
}