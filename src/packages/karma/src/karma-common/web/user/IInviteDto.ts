import { IsString, IsOptional } from 'class-validator';

export interface IInvite {
    password: string;
}

export class IInviteDto implements IInvite {
    @IsString()
    password: string;
}
