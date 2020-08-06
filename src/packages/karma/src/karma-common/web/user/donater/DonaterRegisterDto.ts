import { IsString, IsOptional, IsEmail } from 'class-validator';

export interface IDonaterRegisterDto {
    name: string;
    lastname: string;
    middlename?: string;
    email: string;
    password: string;
}

export class DonaterRegisterDto implements IDonaterRegisterDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    lastname: string;

    @IsOptional()
    @IsString()
    middlename?: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

