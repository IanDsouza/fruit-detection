import React, { Component } from "react";

import { StyleSheet, View, Button } from "react-native";

//importing camera, navigation and Tensorflow(TF) libraries
import { withNavigation } from "react-navigation";
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";

const TensorCamera = cameraWithTensors(Camera);

//setting default values for real-time detection
let frame_count = 0;
const PREDICTION_TIME_INTERVAL = 60;

export class fruitDetection extends Component {
  state = {
    isTfReady: false,
    isModelReady: false,
    image: null,
    //setting camera type, Back facing
    cameraType: Camera.Constants.Type.back,
    predictions: [],
  };

  //it is async beacause we need to wait for TF to load
  //and then proceed
  async componentDidMount() {
    //this function will get trigerred when the componet first attached to the component

    //checking if Tensorflow is loaded
    await tf.ready();
    this.setState({
      isTfReady: true,
    });

    //loading the model
    this.model = await mobilenet.load();
    this.setState({ isModelReady: true });
  }

  saveInstate = (prediction) => {
    this.setState({ predictions: prediction });
  };

  handleCameraStream(images, updatePreview, gl) {
    /*

    This is called every second and each camera frame is passed 
    as a TF structure
    */
    const loop = async () => {
      frame_count += 0.5;

      if (frame_count % PREDICTION_TIME_INTERVAL == 0) {
        const imageTensor = images.next().value;
        if (imageTensor) {
          if (this.model) {
            //make predictions
            let prediction = await this.model.classify(imageTensor);
            if (prediction) {
              tf.dispose([imageTensor]);
              this.saveInstate(prediction);
            }
          }
        }
      }
      requestAnimationFrame(loop);
    };
    try {
      loop();
    } catch (error) {
      console.error("error", error);
    }
  }

  CameraComponent = (textureDims) => {
    return (
      <TensorCamera
        style={{
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
        ref={(ref) => {
          this.camera = ref;
        }}
        type={this.state.cameraType}
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={200}
        resizeWidth={152}
        resizeDepth={3}
        onReady={this.handleCameraStream.bind(this)}
        autorender={true}
      ></TensorCamera>
    );
  };

  render() {
    const { isTfReady, isModelReady, predictions } = this.state;
    let textureDims;
    if (Platform.OS === "ios") {
      textureDims = {
        height: 1920,
        width: 1080,
      };
    } else {
      textureDims = {
        height: 600,
        width: 1600,
      };
    }

    return (
      <View style={styles.container}>
        {this.CameraComponent(textureDims)}

        <View
          style={{
            backgroundColor: "white",
            position: "absolute",
            zIndex: 10,
          }}
        >
          {predictions.map((prediction, i) => {
            if (prediction.probability > 0.7) {
              return (
                <View>
                  <Button
                    style={{
                      width: "100%",
                    }}
                    onPress={() => {
                      this.props.navigation.navigate("NutrientInfo", {
                        fruit: prediction.className,
                      });
                    }}
                    title={
                      "Fruit: " +
                      prediction.className +
                      "   " +
                      "score: " +
                      prediction.probability
                    }
                  />
                </View>
              );
            }
          })}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black",
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  capture: {
    flex: 0,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: "center",
    margin: 20,
  },
});

export default withNavigation(fruitDetection);
