import React, {Component} from 'react';
import MapView, {Circle, Marker} from 'react-native-maps';
import {
  View,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {Text, Item, Input, Card, CardItem} from 'native-base';
import {Icon, Button} from 'react-native-elements';
import {observer, inject} from 'mobx-react';
import Geolocation from '@react-native-community/geolocation';
import {colors} from '../../assets/colors';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import geohash from 'ngeohash';
import * as geolib from 'geolib';
import Toast from '../components/Toast';

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
    const {lastDeliveryLocation} = this.props.authStore.userDetails;

    if (!lastDeliveryLocation) {
      this.setInitialMarkerPosition();
    } else {
      this.decodeGeohash();
    }
  }

  getGeohash = (coordinates) => {
    const {latitude, longitude} = coordinates;

    const coordinateGeohash = geohash.encode(latitude, longitude, 20);

    return coordinateGeohash;
  };

  decodeGeohash() {
    const {lastDeliveryLocation} = this.props.authStore.userDetails;

    const coordinates = geohash.decode(lastDeliveryLocation);

    this.setState({
      markerPosition: {...coordinates},
      circlePosition: {...coordinates},
      mapData: {
        ...coordinates,
        latitudeDelta: 0.04,
        longitudeDelta: 0.05,
      },
      mapReady: true,
    });
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
        timeout: 20000,
      },
    );
  }

  async handleSetLocation() {
    const {newMarkerPosition} = this.state;
    const {navigation} = this.props;
    const {updateCoordinates, getLocationDetails} = this.props.generalStore;
    const {userId, getUserDetails} = this.props.authStore;
    const locationDetails = await getLocationDetails(
      newMarkerPosition.latitude,
      newMarkerPosition.longitude,
    );
    const coordinateGeohash = this.getGeohash(newMarkerPosition);

    /*
    updateCoordinates(userId, coordinateGeohash, locationDetails).then(() => {
      navigation.navigate('Home');

      getUserDetails();

      Toast({text: 'Successfully updated current location'});
    });
    */

    this.props.authStore.setLocationGeohash = coordinateGeohash;
    this.props.generalStore.currentLocationDetails = locationDetails;
    this.props.generalStore.currentLocation = newMarkerPosition;
    navigation.navigate('Home');
    Toast({text: 'Successfully updated current location'});

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
            {!editMode && markerPosition && (
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

        <SafeAreaView
          style={{
            flexDirection: 'row',
            paddingHorizontal: 10,
            paddingBottom: 10,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop:
              Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
          }}>
          <Button
            type="clear"
            icon={<Icon name="arrow-left" color={colors.primary} />}
            buttonStyle={{
              backgroundColor: colors.icons,
            }}
            containerStyle={{
              borderRadius: 24,
              elevation: 5,
            }}
            onPress={() => navigation.goBack()}
          />

          <GooglePlacesAutocomplete
            placeholder="Search"
            enablePoweredByContainer={false}
            onPress={(data, details = null) => {
              // 'details' is provided when fetchDetails = true
              console.log(data, details);
            }}
            query={{
              key:
                Platform.OS === 'android'
                  ? 'AIzaSyDZqSAZvKVizDPaDhtzuzGtfyzCpViZvcs'
                  : 'AIzaSyATHEQKHS5d1taeUBbfsP-IYgJWPLcPBTU',
              language: 'en',
              components: 'country:ph',
            }}
            styles={{
              container: {
                alignSelf: 'flex-start',
              },
              textInputContainer: {
                backgroundColor: 'rgba(0,0,0,0)',
                borderRadius: 24,
                marginTop: -7,
                borderTopWidth: 0,
                borderBottomWidth: 0,
              },
              textInput: {
                alignSelf: 'flex-start',
                margin: 0,
                padding: 0,
                height: 40,
                color: '#5d5d5d',
                fontFamily: 'ProductSans-Light',
                fontSize: 16,
                borderRadius: 24,
              },
              predefinedPlacesDescription: {
                color: colors.accent,
              },
              listView: {
                backgroundColor: colors.icons,
                position: 'absolute',
                marginTop: 40,
              },
            }}
            onFail={(error) => console.warn(error)}
          />
        </SafeAreaView>
      </View>
    );
  }
}
export default SetLocationScreen;
