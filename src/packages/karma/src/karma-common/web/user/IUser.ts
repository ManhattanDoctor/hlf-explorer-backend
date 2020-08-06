import { UserStatus } from './UserStatus';
import { UserType } from './UserType';

export interface IUser {
    id: number;
    ledgerUid?: string;
    lastname: string;
    name: string;
    middlename?: string;
    password?: string;
    email: string;
    status: UserStatus;
    type: UserType;
    publicKey?: string;
    privateKey?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
