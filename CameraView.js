import { Camera, CameraType, requestCameraPermissionsAsync } from "expo-camera";
import { useState, useRef } from "react";
import { StyleSheet, Text, View, ImageBackground, ActivityIndicator, Button, TouchableOpacity } from "react-native";
import { trackEvent } from "@aptabase/react-native";
import { EvilIcons } from "@expo/vector-icons";



export default function CameraView(props) {
  const [type, setType] = useState(CameraType.back);
  const [cameraPermission, setCameraPermission] = Camera.useCameraPermissions();
  const [tookBackPhoto, setTookBackPhoto] = useState(false);
  const [backCameraImageUri, setBackCameraImageUri] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);
  const [takePhotoCount, setTakePhotoCount] = useState(0);

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  function onPictureSaved(photo, backPhoto) {
    if (backPhoto) {
      setTookBackPhoto(true);
      setBackCameraImageUri(photo.uri);
      props.onBackCameraPictureSaved(photo);
    } else {
      props.onFrontCameraPictureSaved(photo);
    }
  }

  async function getCameraPermission() {
    const cameraPermission = await requestCameraPermissionsAsync();
    setCameraPermission(cameraPermission.granted);
  }

  async function takePhoto() {
    if (!cameraReady) {
      return;
    }
    if (!cameraRef) {
      return;
    }
    setTakePhotoCount(takePhotoCount + 1);
    trackEvent("increment", { takePhotoCount });

    await cameraRef.current.takePictureAsync({
      onPictureSaved: (photo) => onPictureSaved(photo, true),
    });
    toggleCameraType();
    setTimeout(
      async () => {
        await cameraRef.current.takePictureAsync({
          onPictureSaved: (photo) => onPictureSaved(photo, false),
        })
      }, 1000
    )

  }

  function getTakePhotoText() {
    return `Take photo`;
  }

  return (
    <View style={styles.container}>
      {cameraPermission && cameraPermission.granted ?

        <Camera
          style={styles.camera}
          type={type}
          ref={cameraRef}
          onCameraReady={() => setCameraReady(true)}
        >{
            tookBackPhoto ?
              <ImageBackground
                source={{ uri: backCameraImageUri }}
                style={styles.container}
              >
                <ActivityIndicator size="large" color="#ffffff" style={styles.loadingIndicator} />
              </ImageBackground>
              :
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.lensButton} onPress={async () => { await takePhoto() }} />
                <EvilIcons name="refresh" size={80} color="white" style={styles.switchCameraIcon} onPress={toggleCameraType} />
              </View>
          }
        </Camera>
        : <View style={styles.askPermissionButton}>
          <Text>
            Camera permission not granted, click here to grant permission
          </Text>
          <Button
            onPress={getCameraPermission}
            title="Grant permission"
            color="#841584"
          />
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    marginTop: "150%",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
  },
  askPermissionText: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    color: "black",
    textAlign: "center",
    justifyContent: "center",
  },
  lensButton: {
    borderRadius: "50%", /* Make it circular */
    borderColor: "white",
    borderWidth: 2,
    width: 80, /* Set the width of the button */
    height: 80, /* Set the height of the button */
    marginLeft: "30%"
  },
  switchCameraIcon: {
    marginLeft: "10%"
  },
});
