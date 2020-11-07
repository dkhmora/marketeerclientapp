import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import StickyParallaxHeader from 'react-native-sticky-parallax-header';
import {BlurView} from '@react-native-community/blur';
import {Button, Icon, Text} from 'react-native-elements';
import {colors} from '../../assets/colors';

const {event, ValueXY} = Animated;
const scrollY = new ValueXY();

class FoodItemDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderForeground = () => (
    <View>
      <Image
        source={{
          uri: 'https://i.ytimg.com/vi/gGca2DVEegc/maxresdefault.jpg',
        }}
        style={styles.foregroundImage}
      />
      <View style={styles.foregroundContainer}>
        <Image
          source={{
            uri:
              'https://is2-ssl.mzstatic.com/image/thumb/Purple123/v4/0c/9e/88/0c9e8824-1373-995f-3be0-30814b1e4d15/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-85-220.png/460x0w.png',
          }}
          style={styles.foregroundLogo}
        />
        <View style={styles.foregroundDetails}>
          <Text style={styles.foregroundDetailsHeader}>The Sims™ Mobile</Text>
          <Text style={styles.foregroundDetailsDesc}>Play with life.</Text>
          <View style={styles.foregroundActionsContainer}>
            <TouchableOpacity style={styles.foregroundActionsButton}>
              <Text style={styles.headerDetailsButtonTitle}>GET</Text>
            </TouchableOpacity>
            <Text style={styles.foregroundActionsButtonTitle}>
              {'In-App\nPurchases'}
            </Text>
            <Icon name="share-2" size={22} style={{marginLeft: 30}} />
          </View>
        </View>
      </View>
    </View>
  );

  renderHeader = () => {
    const opacity = scrollY.y.interpolate({
      inputRange: [0, 110, 150],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    });

    const left = scrollY.y.interpolate({
      inputRange: [0, 110, 160],
      outputRange: [12, 12, -40],
      extrapolate: 'clamp',
    });

    const arrowOpacity = scrollY.y.interpolate({
      inputRange: [0, 110, 140],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View>
        <Animated.View
          style={[
            styles.headerButtonContainer,
            {left},
            {opacity: arrowOpacity},
          ]}>
          <Button
            onPress={() => this.props.navigation.goBack()}
            type="clear"
            color={colors.icons}
            icon={<Icon name="arrow-left" color={colors.primary} />}
            buttonStyle={{borderRadius: 30}}
            containerStyle={[
              styles.buttonContainer,
              {backgroundColor: '#fff', height: 40},
            ]}
          />
        </Animated.View>
        <Animated.View style={[styles.headerContainer, {opacity}]}>
          <View style={styles.headerWrapper}>
            <Animated.View style={[styles.headerSearchContainer, {opacity}]}>
              <Button
                onPress={() => this.props.navigation.goBack()}
                type="clear"
                color={colors.icons}
                icon={<Icon name="arrow-left" color={colors.icons} />}
                buttonStyle={{borderRadius: 30}}
                titleStyle={{color: colors.icons}}
                containerStyle={[styles.buttonContainer, {height: 40}]}
              />

              <Image
                source={{
                  uri:
                    'https://is2-ssl.mzstatic.com/image/thumb/Purple123/v4/0c/9e/88/0c9e8824-1373-995f-3be0-30814b1e4d15/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-85-220.png/460x0w.png',
                }}
                style={styles.headerDetailsImage}
              />

              <Text style={styles.headerSearchText}>Item Name</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    );
  };

  renderBody = () => {
    return (
      <View>
        <Text>Try</Text>
      </View>
    );
  };

  render() {
    /*
    const {
      navigation,
      route: {
        params: {
          item: {image, name},
        },
      },
    } = this.props;
    */

    const {renderForeground, renderHeader} = this;

    return (
      <View style={{...StyleSheet.absoluteFillObject}}>
        <StickyParallaxHeader
          headerType="AvatarHeader"
          hasBorderRadius={false}
          backgroundColor="black"
          scrollEvent={event([{nativeEvent: {contentOffset: {y: scrollY.y}}}], {
            useNativeDriver: false,
          })}
          parallaxHeight={430}
          transparentHeader={true}
          foreground={renderForeground.bind(this)}
          header={renderHeader.bind(this)}
          headerHeight={97}
          snapStartThreshold={50}
          snapStopThreshold={150}
          renderBody={this.renderBody}
          snapValue={167}></StickyParallaxHeader>

        <StatusBar
          translucent
          barStyle="light-content"
          backgroundColor="transparent"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 97,
    backgroundColor: colors.primary,
  },
  headerWrapper: {
    top: StatusBar.currentHeight,
    width: '100%',
    height: 97 - StatusBar.currentHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerImage: {
    width: 18,
    height: 18,
  },
  headerButtonContainer: {
    position: 'absolute',
    top: 50,
    zIndex: 4,
  },
  headerButton: {
    backgroundColor: 'white',
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  headerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 60,
  },
  headerSearchArrow: {
    width: 25,
    height: 25,
  },
  headerSearchText: {
    color: colors.icons,
    fontSize: 20,
  },
  headerDetailsImage: {
    width: 30,
    height: 30,
    marginHorizontal: 10,
    borderRadius: 7.5,
  },
  headerDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  headerDetailsText: {
    marginLeft: 10,
    color: 'gray',
    fontSize: 10,
    textAlign: 'right',
    paddingBottom: 3,
  },
  headerDetailsButton: {
    backgroundColor: '#3479F6',
    width: 80,
    height: 33,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  headerDetailsButtonTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  foregroundImage: {
    width: '110%',
    height: 250,
    marginLeft: -25,
  },
  foregroundContainer: {
    flexDirection: 'row',
    marginBottom: 100,
    marginTop: 27,
    marginLeft: 27,
  },
  foregroundLogo: {
    width: 128,
    height: 128,
    borderRadius: 32,
  },
  foregroundDetails: {
    marginLeft: 15,
  },
  foregroundDetailsHeader: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  foregroundDetailsDesc: {
    color: 'gray',
    fontSize: 20,
  },
  foregroundActionsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'center',
  },
  foregroundActionsButton: {
    backgroundColor: '#3479F6',
    width: 80,
    height: 33,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foregroundActionsButtonTitle: {
    marginLeft: 10,
    color: 'gray',
    fontSize: 10,
  },
  foregroundActionsShare: {
    width: 20,
    height: 20,
    marginLeft: 30,
  },
});

export default FoodItemDetailsScreen;
