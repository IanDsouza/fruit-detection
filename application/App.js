import React, { useState, useEffect } from "react";

//react navigation imports
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

//screen imports
import Home from "./screens/home/home";
import FruitDetection from "./screens/fruitDetection/fruitDetection";
import NutrientInfo from "./screens/nutrientInfo/nutrientInfo";

//create instance for navigaition

//stack is used as main navigation
const Stack = createStackNavigator();

//drawer is used as a side bar,for native experience
const Drawer = createDrawerNavigator();

function HomeNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="DetectFruit" component={FruitDetection} />
      <Stack.Screen name="NutrientInfo" component={NutrientInfo} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeNavigator} />
        <Drawer.Screen name="NutrientInfo" component={NutrientInfo} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
