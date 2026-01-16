
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app component
AppRegistry.registerComponent('App', () => App);

// Run the app
AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
