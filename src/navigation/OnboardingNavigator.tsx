import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeOnboardingScreen from '@screens/onboarding/WelcomeOnboardingScreen';
import InterestsOnboardingScreen from '@screens/onboarding/InterestsOnboardingScreen';
import BudgetOnboardingScreen from '@screens/onboarding/BudgetOnboardingScreen';
import TravelStyleOnboardingScreen from '@screens/onboarding/TravelStyleOnboardingScreen';
import ActivityLevelOnboardingScreen from '@screens/onboarding/ActivityLevelOnboardingScreen';
import AdditionalPreferencesOnboardingScreen from '@screens/onboarding/AdditionalPreferencesOnboardingScreen';
import CompleteOnboardingScreen from '@screens/onboarding/CompleteOnboardingScreen';

const Stack = createStackNavigator();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen
        name="WelcomeOnboarding"
        component={WelcomeOnboardingScreen}
      />
      <Stack.Screen
        name="InterestsOnboarding"
        component={InterestsOnboardingScreen}
      />
      <Stack.Screen
        name="BudgetOnboarding"
        component={BudgetOnboardingScreen}
      />
      <Stack.Screen
        name="TravelStyleOnboarding"
        component={TravelStyleOnboardingScreen}
      />
      <Stack.Screen
        name="ActivityLevelOnboarding"
        component={ActivityLevelOnboardingScreen}
      />
      <Stack.Screen
        name="AdditionalPreferencesOnboarding"
        component={AdditionalPreferencesOnboardingScreen}
      />
      <Stack.Screen
        name="CompleteOnboarding"
        component={CompleteOnboardingScreen}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
