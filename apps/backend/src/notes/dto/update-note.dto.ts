import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateNoteDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsArray()
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    projectId?: string;
}