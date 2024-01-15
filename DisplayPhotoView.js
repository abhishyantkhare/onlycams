import {
  StyleSheet,
  Image,
  ImageBackground,
  View,
  TouchableOpacity,
  Share,
} from "react-native";
import { useRef, useState } from "react";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { captureRef } from "react-native-view-shot";
import { EvilIcons } from "@expo/vector-icons";

export default function DisplayPhotoView(props) {
  const [frontCameraImageUri, setFrontCameraImageUri] = useState(props.frontCameraImageUri);
  const [backCameraImageUri, setBackCameraImageUri] = useState(props.backCameraImageUri);
  const [flipSmallPhoto, setFlipSmallPhoto] = useState(true);
  const [hideButtons, setHideButtons] = useState(false);
  const imageUri = useRef("");
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const swapPhotos = () => {
    const frontCameraImageUriTemp = frontCameraImageUri;
    const backCameraImageUriTemp = backCameraImageUri;
    setFrontCameraImageUri(backCameraImageUriTemp);
    setBackCameraImageUri(frontCameraImageUriTemp);
    setFlipSmallPhoto(!flipSmallPhoto);
  }

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(swapPhotos)();
    });

  const getFlipStyle = () => {
    return {
      transform: [
        { scaleX: flipSmallPhoto ? -1 : 1 },
      ],
    };
  }

  const composed = Gesture.Race(dragGesture, pinchGesture, doubleTapGesture);






  const containerStyle = useAnimatedStyle(() => {
    return {
      height: "30%",
      width: "40%",
      marginLeft: "5%",
      marginTop: "-120%",
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
        { scale: scale.value }
      ],
    };
  });




  async function makeImageUri() {
    setHideButtons(true);
    imageUri.current = await captureRef(this.imageRef);
  }

  async function sharePhoto() {
    await makeImageUri();
    await Share.share({
      url: imageUri.current,
    });
  }

  return (
    <GestureHandlerRootView>
      <ImageBackground
        style={styles.container}
        source={{ uri: backCameraImageUri }}
        ref={(ref) => {
          this.imageRef = ref;
        }}
      >
        {
          props.frontCameraImageUri &&
          <GestureDetector gesture={composed}>
            <Animated.View
              style={containerStyle}
            >
              <Image
                source={{ uri: frontCameraImageUri }}
                style={[styles.smallImage, getFlipStyle()]}
              />
            </Animated.View>
          </GestureDetector>
        }
      </ImageBackground>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={sharePhoto}>
          <EvilIcons name="share-apple" size={72} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={props.onCancel}>
          <EvilIcons name="close" size={72} color="white" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    zIndex: 0,
  },
  smallImage: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: "black",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    height: "20%",
    width: "100%",
    zIndex: 2,
    justifyContent: "center",
  },
  button: {
    marginTop: "-30%",
    marginHorizontal: "5%",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
