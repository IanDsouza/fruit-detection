import React, { Component } from "react";
import { Button, View, Text } from "react-native";

import axios from "axios";

class nutrientInfo extends Component {
  componentDidMount() {
    this.getFruitNutritionDetails();
  }

  getFruitNutritionDetails = () => {
    /*
    Makes a get request and fetches information of the fruit
    */
    const { route } = this.props;
    const params = route.params;

    const URL =
      "http://www.tropicalfruitandveg.com/api/tfvjsonapi.php?tfvitem=" +
      params.fruit;
    axios
      .get(URL)
      .then((response) => {
        console.log("getting data from axios", response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { navigation, route } = this.props;
    const params = route.params;
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text> Selected Fruit {params.fruit} </Text>
        <Text> {params.fruit} </Text>

        <Button
          onPress={() => {
            this.props.navigation.navigate("Home");
          }}
          title="Go Home"
        />
      </View>
    );
  }
}

export default nutrientInfo;
