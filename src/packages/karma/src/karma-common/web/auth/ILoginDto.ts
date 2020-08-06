import { ITraceable } from '@ts-core/common/trace';

export interface ILoginDto extends ITraceable {
    login: string;
    password: string;
}
