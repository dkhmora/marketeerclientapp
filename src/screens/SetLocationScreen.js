import React, {Component} from 'react';
import MapView, {Marker} from 'react-native-maps';
import {
  View,
  StatusBar,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Icon, Button, Image} from 'react-native-elements';
import {observer, inject} from 'mobx-react';
import Geolocation from '@react-native-community/geolocation';
import {colors} from '../../assets/colors';
import geohash from 'ngeohash';
import Toast from '../components/Toast';
import BaseHeader from '../components/BaseHeader';
import RNGooglePlaces from 'react-native-google-places';
import {computed, observable} from 'mobx';

@inject('authStore')
@inject('shopStore')
@inject('generalStore')
@observer
class SetLocationScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      saveChangesLoading: false,
      previousAddress: this.props.generalStore.currentLocationDetails,
      mapReady: false,
      mapData: {
        latitude: 14.629636,
        longitude: 121.015193,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
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
    const {locationError} = this.props.route.params;

    if (currentLocation) {
      this.setCoordinates();
    } else if (locationError) {
      this.setState({mapReady: true, editMode: true});
    } else {
      setCurrentLocation();
    }
  }

  getGeohash = (coordinates) => {
    const {latitude, longitude} = coordinates;

    const coordinatesGeohash = geohash.encode(latitude, longitude, 12);

    return coordinatesGeohash;
  };

  setCoordinates() {
    const {currentLocation} = this.props.generalStore;

    this.setState({
      markerPosition: {...currentLocation},
      circlePosition: {...currentLocation},
      mapData: {
        ...currentLocation,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
      },
      mapReady: true,
    });
  }

  async handleSetLocation() {
    const {newMarkerPosition} = this.state;
    const {navigation} = this.props;
    const {checkout} = this.props.route.params;

    const coordinatesGeohash = await this.getGeohash(newMarkerPosition);

    this.setState({loading: true});

    this.props.generalStore.deliverToCurrentLocation = false;
    this.props.generalStore.deliverToLastDeliveryLocation = false;
    this.props.generalStore.deliverToSetLocation = true;

    this.props.generalStore.currentLocationDetails = this.selectedLocationAddress;
    this.props.generalStore.currentLocationGeohash = coordinatesGeohash;
    this.props.generalStore.currentLocation = newMarkerPosition;

    if (checkout) {
      navigation.navigate('Checkout');

      Toast({text: 'Successfully set location!'});

      this.setState({loading: false});
    } else {
      navigation.navigate('Home');

      this.props.shopStore.getStoreList({
        currentLocationGeohash: coordinatesGeohash,
        locationCoordinates: newMarkerPosition,
      });

      Toast({text: 'Successfully set location!'});

      this.setState({loading: false});
    }

    this.setState({
      editMode: false,
      markerPosition: newMarkerPosition,
    });
  }

  panMapToLocation(position) {
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

  panMapToMarker() {
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
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
      },
      newMarkerPosition: this.state.markerPosition,
      previousAddress: this.props.generalStore.currentLocationDetails,
      initialRadius: this.state.radius,
      editMode: true,
    });

    clearTimeout(this.getAddressTimeout);

    this.panMapToMarker();
  }

  handleCancelChanges() {
    const {markerPosition} = this.state;

    this.props.generalStore.currentLocationDetails = this.state.previousAddress;

    this.setState({
      mapData: {...markerPosition, latitudeDelta: 0.009, longitudeDelta: 0.009},
      newMarkerPosition: null,
      editMode: false,
    });

    clearTimeout(this.getAddressTimeout);

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
    RNGooglePlaces.openAutocompleteModal({country: 'PH'}, ['location'])
      .then((place) => {
        const coordinates = place.location;

        this.panMapToLocation(coordinates);

        this.setState({
          newMarkerPosition: {...coordinates},
          editMode: true,
        });
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
    const {checkout, locationError} = this.props.route.params;
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
            provider="google"
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
              {!locationError && (
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
              )}

              <Button
                title="Set Location"
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
            <View>
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

              {checkout && (
                <Button
                  title="Proceed to Checkout"
                  onPress={() => navigation.navigate('Checkout')}
                  iconLeft
                  icon={
                    <Image
                      source={require('../../assets/images/logo_cart.png')}
                      style={{width: 27, height: 27, resizeMode: 'center'}}
                      textStyle={{fontFamily: 'ProductSans-Light'}}
                    />
                  }
                  titleStyle={{color: colors.icons, marginLeft: 5}}
                  buttonStyle={{backgroundColor: colors.accent}}
                  containerStyle={{
                    marginTop: 10,
                    borderRadius: 24,
                    overflow: 'hidden',
                  }}
                />
              )}
            </View>
          )}
        </View>

        <BaseHeader
          backButton={locationError ? false : true}
          navigation={navigation}
          title={headerTitle}
          noLeftComponent={locationError ? true : false}
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
