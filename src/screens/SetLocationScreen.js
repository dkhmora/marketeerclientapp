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
import geohash from 'ngeohash';
import * as geolib from 'geolib';
import Toast from '../components/Toast';
import BaseHeader from '../components/BaseHeader';
import RNGooglePlaces from 'react-native-google-places';
import {computed, observable} from 'mobx';

@inject('authStore')
@inject('generalStore')
@observer
class SetLocationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      saveChangesLoading: false,
      mapReady: false,
      mapData: null,
      editMode: false,
      loading: false,
      newMarkerPosition: null,
      centerOfScreen: (Dimensions.get('window').height - 17) / 2,
    };
  }

  @observable selectedLocationAddress = null;

  @computed get headerTitle() {
    const {currentLocationDetails} = this.props.generalStore;
    const {selectedLocationAddress} = this;

    if (selectedLocationAddress) {
      return selectedLocationAddress;
    } else if (currentLocationDetails) {
      return currentLocationDetails;
    } else {
      return 'Selected Location';
    }
  }

  componentDidMount() {
    const {currentLocation, setCurrentLocation} = this.props.generalStore;

    if (currentLocation) {
      this.setCoordinates();
    } else {
      setCurrentLocation();
    }
  }

  getGeohash = (coordinates) => {
    const {latitude, longitude} = coordinates;

    const coordinatesGeohash = geohash.encode(latitude, longitude, 20);

    return coordinatesGeohash;
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

  async handleSetLocation() {
    const {newMarkerPosition} = this.state;
    const {navigation} = this.props;
    const {checkout} = this.props.route.params;

    const coordinatesGeohash = this.getGeohash(newMarkerPosition);

    this.setState({loading: true});

    this.props.generalStore.deliverToCurrentLocation = false;
    this.props.generalStore.deliverToLastDeliveryLocation = false;
    this.props.generalStore.deliverToSetLocation = true;

    this.props.generalStore.currentLocationDetails = this.selectedLocationAddress;
    this.props.generalStore.locationGeohash = coordinatesGeohash;
    this.props.generalStore.currentLocation = newMarkerPosition;

    if (checkout) {
      navigation.navigate('Checkout');

      Toast({text: 'Successfully set location!'});

      this.setState({loading: false});
    } else {
      navigation.navigate('Home');

      Toast({text: 'Successfully set location!'});

      this.setState({loading: false});
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
    } else {
      Geolocation.requestAuthorization();
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

    this.selectedLocationAddress = null;

    this.panMapToMarker();
  }

  handleRegionChange = (mapData) => {
    const {editMode} = this.state;

    if (editMode) {
      this.setState({
        newMarkerPosition: mapData,
      });

      clearTimeout(this.getAddressTimeout);

      this.setSelectedLocationAddress(mapData);
    }
  };

  async setSelectedLocationAddress(mapData) {
    this.setState({saveChangesLoading: true});

    this.getAddressTimeout = setTimeout(async () => {
      this.selectedLocationAddress = await this.props.generalStore.getAddressFromCoordinates(
        {
          ...mapData,
        },
      );

      this.setState({saveChangesLoading: false});
    }, 1000);
  }

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
          newMarkerPosition: {...coordinates},
          editMode: true,
        });

        this.props.generalStore.currentLocationDetails = address;
      })
      .catch((error) => console.log(error.message));
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
      saveChangesLoading,
    } = this.state;
    const {headerTitle} = this;

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
                loading={saveChangesLoading}
                disabled={saveChangesLoading}
                disabledStyle={{
                  backgroundColor: colors.accent,
                  borderRadius: 24,
                  width: 40,
                  overflow: 'hidden',
                }}
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
          title={headerTitle}
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
