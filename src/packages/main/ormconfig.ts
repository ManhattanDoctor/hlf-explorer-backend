import { AppSettings } from './src/AppSettings';
import { DatabaseModule } from './src/DatabaseModule';

const settings = new AppSettings();
const config = DatabaseModule.getOrmConfig(settings);
export = config;
