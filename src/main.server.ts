import './polyfills.server';
import { startServer } from './server';
import { ServerAppModule } from './modules/app/server-app.module';

startServer(ServerAppModule);
