import { IsString, IsNumber, IsPositive } from 'class-validator';

export interface IProjectCreateDto {
    name: string;
    description: string;
}

export class ProjectCreateDto implements IProjectCreateDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber()
    companyId: number;

    @IsNumber()
    @IsPositive()
    amount: number;
}
