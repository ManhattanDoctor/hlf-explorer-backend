import { ProjectStatus } from './ProjectStatus';

export interface IProject {
    id: number;
    name: string;
    description: string;
    status: ProjectStatus;
}
