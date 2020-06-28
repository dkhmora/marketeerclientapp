import React, {Component} from 'react';
import MapView, {Circle, Marker} from 'react-native-maps';
import {
  View,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Dimensions,
} from 'react-native';
import {Button, Text, Item, Input, Card, CardItem} from 'native-base';
import {Icon} from 'react-native-elements';
import {Slider} from 'react-native-elements';
import {observer, inject} from 'mobx-react';
import Geolocation from '@react-native-community/geolocation';

@inject('authStore')
@inject('generalStore')
@observer
class SetLocationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapReady: false,
      mapData: null,
      editMode: false,
      radius: 0,
      initialRadius: 0,
      newMarkerPosition: null,
      centerOfScreen: (Dimensions.get('window').height - 17) / 2,
    };
  }

  componentDidMount() {
    this.setInitialMarkerPosition();
  }

  async setInitialMarkerPosition() {
    await Geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: parseFloat(position.coords.latitude),
          longitude: parseFloat(position.coords.longitude),
        };

        this.setState({
          markerPosition: {
            ...coords,
          },
          newMarkerPosition: {
            ...coords,
          },
          mapData: {
            ...coords,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05,
          },
          circlePosition: {
            ...coords,
          },
          mapReady: true,
        });
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        timeout: 20000,
      },
    );
  }

  _onMapReady = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then((granted) => {
        console.log(granted); // just to ensure that permissions were granted
      });
    }
  };

  render() {
    const {navigation} = this.props;
    const {
      markerPosition,
      radius,
      circlePosition,
      centerOfScreen,
      mapData,
      mapReady,
      editMode,
    } = this.state;

    return (
      <View style={{flex: 1}}>
        <StatusBar translucent backgroundColor="transparent" />

        {mapReady && (
          <MapView
            style={{...StyleSheet.absoluteFillObject}}
            ref={(map) => {
              this.map = map;
            }}
            onRegionChangeComplete={this.handleRegionChange}
            showsUserLocation
            followsUserLocation
            onMapReady={() => {
              this._onMapReady();
            }}
            initialRegion={mapData}>
            {!editMode && (
              <Marker
                ref={(marker) => {
                  this.marker = marker;
                }}
                tracksViewChanges={false}
                coordinate={markerPosition}>
                <View>
                  <Icon
                    style={{
                      color: '#B11C01',
                      fontSize: 34,
                    }}
                    name="pin"
                    solid
                  />
                </View>
              </Marker>
            )}
            <Circle
              center={circlePosition}
              radius={radius * 1000}
              fillColor="rgba(233, 30, 99, 0.3)"
              strokeColor="rgba(0,0,0,0.5)"
              zIndex={2}
              strokeWidth={2}
            />
          </MapView>
        )}
        {editMode && (
          <View
            style={{
              left: 0,
              right: 0,
              marginLeft: 0,
              marginTop: 0,
              position: 'absolute',
              top: centerOfScreen,
              alignItems: 'center',
            }}>
            <Icon
              style={{
                color: '#B11C01',
                fontSize: 34,
              }}
              name="pin"
              solid
            />
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            alignSelf: 'flex-start',
            justifyContent: 'flex-start',
            top: '-7%',
          }}>
          <Button
            transparent
            onPress={() => navigation.goBack()}
            style={{marginTop: 100}}>
            <Icon name="arrow-left" style={{fontSize: 32}} />
          </Button>
        </View>
        <View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            justifyContent: 'center',
            bottom: '5%',
          }}>
          {editMode ? (
            <View style={{flexDirection: 'row'}}>
              <Button
                iconLeft
                rounded
                danger
                onPress={() => this.handleCancelChanges()}
                style={{marginRight: 20}}>
                <Icon name="close" />
                <Text>Cancel Changes</Text>
              </Button>
              <Button
                iconLeft
                rounded
                success
                onPress={() => this.handleSetStoreLocation()}>
                <Icon name="save" />
                <Text>Save Changes</Text>
              </Button>
            </View>
          ) : (
            <Button
              iconLeft
              onPress={() => this.handleEditDeliveryArea()}
              style={{borderRadius: 24, overflow: 'hidden'}}>
              <Icon name="create" />
              <Text>Edit Delivery Area</Text>
            </Button>
          )}
        </View>
      </View>
    );
  }
}
export default SetLocationScreen;
