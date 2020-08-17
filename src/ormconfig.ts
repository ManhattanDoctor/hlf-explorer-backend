import { AppSettings } from './AppSettings';
import { DatabaseModule } from './database/DatabaseModule';

const settings = new AppSettings();
const config = DatabaseModule.getOrmConfig(settings);
export = config;
