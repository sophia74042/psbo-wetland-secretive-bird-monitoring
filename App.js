import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SiteSetupScreen from './src/screens/SiteSetupScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import EquipmentSetupScreen from './src/screens/EquipmentSetupScreen';
import SurveyPointSetupScreen from './src/screens/SurveyPointSetupScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import SummaryScreen from './src/screens/SummaryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SiteSetup" component={SiteSetupScreen} />
          <Stack.Screen name="RemindersScreen" component={RemindersScreen} />
          <Stack.Screen name="EquipmentSetup" component={EquipmentSetupScreen} />
          <Stack.Screen name="SurveyPointSetup" component={SurveyPointSetupScreen} />
          <Stack.Screen name="Collection" component={CollectionScreen} />
          <Stack.Screen name="Summary" component={SummaryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
