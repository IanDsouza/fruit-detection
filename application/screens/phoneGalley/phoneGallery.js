import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import Tflite from "tflite-react-native";
import ImagePicker from "react-native-image-picker";

let tflite = new Tflite();

const height = 128;
const width = 128;
const blue = "#25d5fd";
const mobile = "MobileNet";

export default class PhoneGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      model: null,
      source: null,
      imageHeight: height,
      imageWidth: width,
      recognitions: [],
    };
  }

  onSelectModel(model) {
    this.setState({ model });

    //setting the custom model file path
    var modelFile = "models/finalModel.tflite";
    var labelsFile = "models/NewLabel.txt";

    //loading the model from the path
    tflite.loadModel(
      {
        model: modelFile,
        labels: labelsFile,
      },
      (err, res) => {
        if (err) console.log(err);
        else console.log(res);
      }
    );
  }

  onSelectImage() {
    //on image clicked, fetch the image URI and pass it to the model
    const options = {
      title: "Please select image",
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        alert("Please try again!");
      } else {
        var path =
          Platform.OS === "ios" ? response.uri : "file://" + response.path;
        var w = response.width;
        var h = response.height;
        this.setState({
          source: { uri: path },
          imageHeight: (h * width) / w,
          imageWidth: width,
        });

        tflite.runModelOnImage(
          {
            path,
            imageMean: 128.0,
            imageStd: 128.0,
            numResults: 3,
            threshold: 0.05,
          },
          (err, res) => {
            if (err) console.log(err);
            else this.setState({ recognitions: res });
          }
        );
      }
    });
  }

  renderResults() {
    const { model, recognitions, imageHeight, imageWidth } = this.state;

    return recognitions.map((res, id) => {
      return (
        <Text key={id}>
          {res["Fruit"] + "-" + (res["Score"] * 100).toFixed(0) + "%"}
        </Text>
      );
    });
  }

  render() {
    const { model, source, imageHeight, imageWidth } = this.state;
    var renderButton = (m) => {
      return (
        <TouchableOpacity
          style={styles.button}
          onPress={this.onSelectModel.bind(this, m)}
        >
          <Text style={styles.buttonText}>{m}</Text>
        </TouchableOpacity>
      );
    };
    return (
      <View style={styles.container}>
        {model ? (
          <TouchableOpacity
            style={[
              styles.imageContainer,
              {
                height: imageHeight,
                width: imageWidth,
                borderWidth: source ? 0 : 2,
              },
            ]}
            onPress={this.onSelectImage.bind(this)}
          >
            {source ? (
              <Image
                source={source}
                style={{
                  height: imageHeight,
                  width: imageWidth,
                }}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.text}>Select Picture</Text>
            )}
            <View style={styles.boxes}>{this.renderResults()}</View>
          </TouchableOpacity>
        ) : (
          <View>{renderButton(mobile)}</View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  imageContainer: {
    borderColor: blue,
    borderRadius: 5,
    alignItems: "center",
  },
  text: {
    color: blue,
  },
  button: {
    width: 200,
    backgroundColor: blue,
    borderRadius: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
  },
  box: {
    position: "absolute",
    borderColor: blue,
    borderWidth: 2,
  },
  boxes: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});
