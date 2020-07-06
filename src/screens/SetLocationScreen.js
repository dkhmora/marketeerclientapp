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
  ActivityIndicator,
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
import BaseHeader from '../components/BaseHeader';
import RNGooglePlaces from 'react-native-google-places';

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
      loading: false,
      address: null,
      newMarkerPosition: null,
      centerOfScreen: (Dimensions.get('window').height - 17) / 2,
    };
  }

  componentDidMount() {
    const {currentLocation} = this.props.generalStore;

    if (!currentLocation) {
      this.setInitialMarkerPosition();
    } else {
      this.setCoordinates();
    }
  }

  getGeohash = (coordinates) => {
    const {latitude, longitude} = coordinates;

    const coordinateGeohash = geohash.encode(latitude, longitude, 20);

    return coordinateGeohash;
  };

  setCoordinates() {
    const {currentLocation} = this.props.generalStore;

    this.setState({
      markerPosition: {...currentLocation},
      circlePosition: {...currentLocation},
      mapData: {
        ...currentLocation,
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
    const {newMarkerPosition, address} = this.state;
    const {navigation} = this.props;
    const {updateCoordinates} = this.props.generalStore;
    const {userId, getUserDetails} = this.props.authStore;
    const {checkout} = this.props.route.params;

    const coordinateGeohash = this.getGeohash(newMarkerPosition);

    this.setState({loading: true});

    if (!address) {
      this.setState(
        {
          address: await this.props.generalStore.getAddressFromCoordinates({
            ...newMarkerPosition,
          }),
        },
        () => {
          if (checkout) {
            updateCoordinates(
              userId,
              coordinateGeohash,
              this.state.address,
            ).then(() => {
              navigation.navigate('Home');

              getUserDetails();

              Toast({text: 'Successfully set location!'});

              this.setState({loading: false});

              this.props.generalStore.currentLocationDetails = this.state.address;
              this.props.authStore.setLocationGeohash = coordinateGeohash;
              this.props.generalStore.currentLocation = newMarkerPosition;
            });
          } else {
            Toast({text: 'Successfully set location!'});

            this.setState({loading: false});

            this.props.generalStore.currentLocationDetails = this.state.address;
            this.props.authStore.setLocationGeohash = coordinateGeohash;
            this.props.generalStore.currentLocation = newMarkerPosition;
          }
        },
      );
    } else {
      if (checkout) {
        updateCoordinates(userId, coordinateGeohash, this.state.address).then(
          () => {
            navigation.navigate('Home');

            getUserDetails();

            Toast({text: 'Successfully set location!'});

            this.setState({loading: false});

            this.props.generalStore.currentLocationDetails = this.state.address;
            this.props.authStore.setLocationGeohash = coordinateGeohash;
            this.props.generalStore.currentLocation = newMarkerPosition;
          },
        );
      } else {
        Toast({text: 'Successfully set location!'});

        this.setState({loading: false});

        this.props.generalStore.currentLocationDetails = this.state.address;
        this.props.authStore.setLocationGeohash = coordinateGeohash;
        this.props.generalStore.currentLocation = newMarkerPosition;
      }
    }

    this.setState({
      editMode: false,
      markerPosition: newMarkerPosition,
    });
  }

  panMapToLocation(position) {
    if (Platform.OS === 'ios') {
      this.map.animateCamera(
        {
          center: position,
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
          center: position,
          pitch: 2,
          heading: 1,
          altitude: 200,
          zoom: 18,
        },
        150,
      );
    }
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
          altitude: 200,
          zoom: 18,
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

  openSearchModal() {
    RNGooglePlaces.openAutocompleteModal({country: 'PH'}, [
      'address',
      'location',
    ])
      .then((place) => {
        const address = place.address;
        const coordinates = place.location;

        this.panMapToLocation(coordinates);

        this.setState({
          address,
          newMarkerPosition: {...coordinates},
          editMode: true,
        });
        // place represents user's selection from the
        // suggestions and it is a simplified Google Place object.
      })
      .catch((error) => console.log(error.message)); // error is a Javascript Error object
  }

  render() {
    const {navigation} = this.props;
    const {
      markerPosition,
      centerOfScreen,
      mapData,
      mapReady,
      editMode,
      loading,
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

        <BaseHeader
          backButton
          navigation={navigation}
          title="Delivery Area"
          rightComponent={
            <Button
              type="clear"
              icon={<Icon name="search" color={colors.icons} />}
              titleStyle={{color: colors.icons}}
              buttonStyle={{borderRadius: 24}}
              onPress={() => this.openSearchModal()}
            />
          }
        />

        {loading && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                flex: 1,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            <ActivityIndicator animating color={colors.primary} size="large" />
          </View>
        )}
      </View>
    );
  }
}
export default SetLocationScreen;
