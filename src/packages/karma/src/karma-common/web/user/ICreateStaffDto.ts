import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';
import { RoleName } from '../role/RoleName';

export interface ICreateStaffDto {
    lastname: string;
    name: string;
    middlename?: string;
    email: string;
    roles?: Array<RoleName>;
}

export class CreateStaffDto implements ICreateStaffDto {
    @IsString()
    lastname: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    middlename?: string;

    @IsEmail()
    email: string;

    @IsArray()
    roles?: Array<RoleName>;
}
