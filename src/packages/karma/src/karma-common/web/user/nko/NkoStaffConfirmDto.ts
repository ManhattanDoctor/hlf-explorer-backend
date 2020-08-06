import { IsString, IsOptional, IsEmail, IsUUID } from 'class-validator';

export interface INkoStaffConfirmDto {
    token: string;
}

export class NkoStaffConfirmDto implements INkoStaffConfirmDto {
    @IsUUID('4')
    @IsString()
    token: string;
}

