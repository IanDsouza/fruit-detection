const TensorCamera = cameraWithTensors(Camera);

const PREDICTION_INTERVAL = 60;

let modelTest;

let frame_id = 0;
class App extends React.Component {
  state = {
    isTfReady: false,
    isModelReady: false,
    image: null,
    cameraType: Camera.Constants.Type.back,
    predictions: [],
  };

  async componentDidMount() {
    await tf.ready();
    this.setState({
      isTfReady: true,
    });
    this.model = await mobilenet.load();
    console.log("model mountt", this.model.version);
    modelTest = this.model;
    this.setState({ isModelReady: true });
  }

  saveInstate = (prediction) => {
    console.log("in save");
    this.setState({ predictions: prediction });
  };

  imageToTensor(rawImageData) {
    const TO_UINT8ARRAY = true;
    console.log("raw", rawImageData);
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3);
    let offset = 0; // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];
      offset += 4;
    }

    return tf.tensor3d(buffer, [height, width, 3]);
  }

  takePicture = async () => {
    console.log("saved model", modelTest.version);
    console.log("pic 1", this.camera);
    // console.log("val", this.camera.value());

    // console.log("model", this.model.version);

    // if (this.camera) {
    //   const options = { quality: 0.5, base64: true };
    //   const data = await this.camera.takePictureAsync(options);
    //   console.log("cam", data);
    // }
  };

  handleCameraStream(images, updatePreview, gl) {
    const loop = async () => {
      frame_id += 0.5;

      console.log("frame", this.state.isTfReady);
      if (modelTest) {
        console.log("M", modelTest.version);
      }

      let current_ts = Date.now();
      if (frame_id % PREDICTION_INTERVAL == 0) {
        const imageTensor = images.next().value;
        // console.log("tensor", imageTensor);

        if (imageTensor) {
          const start_prediction = Date.now();

          if (modelTest) {
            console.log("inside teensor got modeltest");
            let prediction = await modelTest.classify(imageTensor);
            console.log("prediction", prediction);
            if (prediction) {
              console.log("got pred");
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
      console.error("exce", error);
    }
  }

  render() {
    const { isTfReady, isModelReady, predictions, image } = this.state;
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
      <View style={styles1.container}>
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
        {/* ) : (
    <Text style={{ fontSize: 14 }}> SNAP1</Text>
  // )} */}

        <View
          style={{
            backgroundColor: "white",
            position: "absolute",
            zIndex: 10,
          }}
        >
          {predictions.map((prediction, i) => {
            return (
              <View>
                <Text key={i}> Object: {prediction.className}</Text>
                <Text key={i}> Probability: {prediction.probability}</Text>
              </View>
            );
          })}

          {/* <TouchableOpacity
      onPress={this.takePicture.bind(this)}
      style={styles.capture}
    >
      <Text style={{ fontSize: 14 }}> SNAP</Text>
    </TouchableOpacity> */}
        </View>
      </View>
    );
  }
}

const styles1 = StyleSheet.create({
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black",
  },
  loadingContainer: {
    marginTop: 80,
    justifyContent: "center",
  },
  text: {
    color: "black",
    fontSize: 16,
  },
  loadingModelContainer: {
    flexDirection: "row",
    marginTop: 10,
  },

  tfLogo: {
    width: 125,
    height: 70,
  },
  capture: {
    flex: 0,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 30,
    paddingHorizontal: 20,
    alignSelf: "center",
    margin: 20,
  },
});

export default App;
