import { IsString, IsOptional, IsArray } from 'class-validator';

export interface ICompanyCreateDto {
    name: string;
    description?: string;
    attributes: { [key: string]: string }[];
}

export class CompanyCreateDto implements ICompanyCreateDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    attributes: { [key: string]: string }[];
}
