import { CompanyStatus } from './CompanyStatus';

export interface ICompany {
    id: number;
    name: string;
    description?: string;
    status: CompanyStatus;
}

