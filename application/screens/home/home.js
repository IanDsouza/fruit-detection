import React, { Component } from "react";
import { Button, View, Text } from "react-native";
import { withNavigation } from "react-navigation";

class home extends Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text> Welcome to the Fruit Analysis Application </Text>

        <Text> Please click on Scan Fruits to proceeed </Text>

        <Button
          onPress={() => {
            this.props.navigation.navigate("DetectFruit");
          }}
          title="Scan Fruits"
        />
      </View>
    );
  }
}

// export default home;
export default withNavigation(home);
