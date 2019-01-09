import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    showCamera: true,
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View style={{ flex: 1 }}>
        {this.state.showCamera &&
          <BarCodeScanner
            onBarCodeScanned={this.handleBarCodeScanned}
            barCodeTypes={['org.iso.Code128']}
            style={StyleSheet.absoluteFill}
          />
        }
      </View>
    );
  }

  mAlert = (msg) => {
    Alert.alert(msg,
      '',
      [{
        text: 'OK',
        onPress: () => {this.setState({ showCamera: true });}
      }],
      { cancelable: false }
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    if (data.substring(0, 2) !== 'VN' && data.substring(data.length - 2) !== 'VN' && data.substring(0, 4) !== 'NLVN') {
      return;
    }
    this.setState({ showCamera: false });

    var formData  = new FormData();
    formData.append('tracking_code', data);
    fetch('https://lazada-suli.herokuapp.com/update-not-returned', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((dataRes) => {
        if (dataRes.ok) {
          this.mAlert(`[${data}]-Success`)
        } else {
          this.mAlert(`[${data}]-${dataRes.error}`);
        }
      })
      .catch((err) => {
        this.mAlert(`[${data}]-${JSON.stringify(err)}`);
      });
  }
}