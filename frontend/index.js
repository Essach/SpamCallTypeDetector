import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';
import headlessCallTask from './headlessCallTask';
import { name as appName } from './app.json';

AppRegistry.registerHeadlessTask('IncomingCallCheck', () => headlessCallTask);

registerRootComponent(App);