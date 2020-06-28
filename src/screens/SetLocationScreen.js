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
import {Text, Item, Input, Card, CardItem} from 'native-base';
import {Icon, Button} from 'react-native-elements';
import {observer, inject} from 'mobx-react';
import Geolocation from '@react-native-community/geolocation';
import {colors} from '../../assets/colors';
import {SafeAreaView} from 'react-native-safe-area-context';

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

  handleSetLocation() {
    const {newMarkerPosition} = this.state;

    /*
    updateCoordinates(
      merchantId,
      newMarkerPosition.latitude,
      newMarkerPosition.longitude,
      radius,
    );
    */

    this.setState({
      editMode: false,
      markerPosition: newMarkerPosition,
    });
  }

  panMapToMarker() {
    if (Platform.OS === 'ios') {
      this.map.animateCamera(
        {
          center: this.state.markerPosition,
          pitch: 2,
          heading: 20,
          altitude: 6000,
          zoom: 5,
        },
        150,
      );
    } else {
      this.map.animateCamera(
        {
          center: this.state.markerPosition,
          pitch: 2,
          heading: 1,
          altitude: 500,
          zoom: 15,
        },
        150,
      );
    }
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

  handleEditDeliveryArea() {
    this.setState({
      mapData: {
        ...this.state.markerPosition,
        latitudeDelta: 0.04,
        longitudeDelta: 0.05,
      },
      newMarkerPosition: this.state.markerPosition,
      initialRadius: this.state.radius,
      editMode: true,
    });

    this.panMapToMarker();
  }

  handleCancelChanges() {
    const {markerPosition} = this.state;

    this.setState({
      mapData: {...markerPosition, latitudeDelta: 0.04, longitudeDelta: 0.05},
      newMarkerPosition: null,
      editMode: false,
    });

    this.panMapToMarker();
  }

  handleRegionChange = (mapData) => {
    const {editMode} = this.state;
    const {latitude, longitude} = mapData;

    if (editMode) {
      this.setState({
        newMarkerPosition: {
          latitude,
          longitude,
        },
      });
    }
  };

  render() {
    const {navigation} = this.props;
    const {
      markerPosition,
      centerOfScreen,
      mapData,
      mapReady,
      editMode,
    } = this.state;

    return (
      <View style={{flex: 1}}>
        <StatusBar animated translucent backgroundColor="rgba(0,0,0,0.3)" />

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
                  <Icon color={colors.primary} name="map-pin" />
                </View>
              </Marker>
            )}
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
            <Icon color={colors.primary} name="map-pin" />
          </View>
        )}
        <SafeAreaView
          style={{
            position: 'absolute',
            paddingTop: 50,
            paddingLeft: 50,
          }}>
          <Button
            type="clear"
            icon={<Icon name="arrow-left" color={colors.primary} />}
            buttonStyle={{backgroundColor: colors.icons}}
            containerStyle={{borderRadius: 24, elevation: 5}}
            onPress={() => navigation.goBack()}
          />
        </SafeAreaView>
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
                icon={<Icon name="x" color={colors.icons} />}
                onPress={() => this.handleCancelChanges()}
                buttonStyle={{backgroundColor: 'red'}}
                containerStyle={{
                  borderRadius: 24,
                  marginRight: 10,
                  overflow: 'hidden',
                }}
              />
              <Button
                title="Save Changes"
                iconLeft
                icon={<Icon name="save" color={colors.icons} />}
                onPress={() => this.handleSetLocation()}
                titleStyle={{color: colors.icons, marginLeft: 5}}
                buttonStyle={{backgroundColor: colors.accent}}
                containerStyle={{
                  borderRadius: 24,
                  overflow: 'hidden',
                }}
              />
            </View>
          ) : (
            <Button
              title="Change Delivery Location"
              iconLeft
              icon={<Icon name="edit" color={colors.icons} />}
              onPress={() => this.handleEditDeliveryArea()}
              titleStyle={{color: colors.icons, marginLeft: 5}}
              buttonStyle={{backgroundColor: colors.primary}}
              containerStyle={{
                borderRadius: 24,
                overflow: 'hidden',
              }}
            />
          )}
        </View>
      </View>
    );
  }
}
export default SetLocationScreen;
