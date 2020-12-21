function executeAuthStateListener() {
  this.authState = auth().onAuthStateChanged((user) => {
    generalStore.appReady = false;

    authStore.checkAuthStatus().then(() => {
      if (user) {
        const {isAnonymous, email, displayName, phoneNumber, uid} = user;

        this.setState({user}, () => {
          crashlytics().setAttributes({
            email,
            displayName,
            phoneNumber,
            uid,
            isAnonymous: isAnonymous.toString(),
          });
        });

        if (!authStore.guest) {
          authStore.reloadUser().then(() => {
            if (shopStore.cartStores.length !== 0) {
              shopStore.updateCartItemsInstantly().then(() => {
                shopStore.getCartItems(uid);
              });
            } else {
              shopStore.getCartItems(uid);
            }

            requestNotifications(['alert', 'badge', 'sound', 'lockScreen'])
              .then(({status, settings}) => {
                return generalStore.getUserDetails(uid);
              })
              .then(() => (generalStore.appReady = true));

            if (!generalStore.currentLocation) {
              return generalStore.setCurrentLocation();
            } else {
              return generalStore.setLastDeliveryLocation();
            }
          });
        } else {
          if (shopStore.unsubscribeToGetCartItems) {
            shopStore.unsubscribeToGetCartItems();
          }

          if (generalStore.unsubscribeUserDetails) {
            generalStore.unsubscribeUserDetails();
          }

          if (!generalStore.currentLocation) {
            return generalStore.setCurrentLocation();
          }
        }

        AppState.addEventListener('change', (state) => {
          if (!authStore.guest) {
            if (state === 'active') {
              if (!authStore.guest && user) {
                shopStore.getCartItems(uid);
                generalStore.getUserDetails(uid);
              }
            } else if (state === 'background') {
              if (shopStore.unsubscribeToGetCartItems) {
                shopStore.unsubscribeToGetCartItems();
              }

              if (generalStore.unsubscribeUserDetails) {
                generalStore.unsubscribeUserDetails();
              }
            } else if (state === 'inactive') {
              if (shopStore.unsubscribeToGetCartItems) {
                shopStore.unsubscribeToGetCartItems();
              }

              if (generalStore.unsubscribeUserDetails) {
                generalStore.unsubscribeUserDetails();
              }
            }
          }
        });
      }
    });
  });
}