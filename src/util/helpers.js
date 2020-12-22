import moment from 'moment';
import {Linking} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {colors} from '../../assets/colors';
import Toast from '../components/Toast';
import {daysList, dynamicLinkUrlActions} from './variables';

const twentyFourHourToTwelveHour = (time) =>
  moment(time, 'HH:mm').format('h:mm A');

const extractStoreHoursArray = (storeHours) => {
  return daysList.map((day, index) => {
    const currentStoreHours = storeHours?.[day];

    if (currentStoreHours !== undefined) {
      const {closed, start, end} = currentStoreHours;

      if (closed === true) {
        return `${day}: Closed`;
      }

      return `${day}: ${twentyFourHourToTwelveHour(
        start,
      )} - ${twentyFourHourToTwelveHour(end)}`;
    }
  });
};

const getNextStoreOperationDate = (storeHours) => {
  const now = moment();
  const currentTime = now.format('HH:mm');
  const currentDay = now.format('dddd');
  const currentDayIndex = Number(moment(currentDay, 'dddd').format('e'));
  let nextStoreOperationDate = null;

  if (storeHours) {
    [...Array(7 + currentDayIndex).keys()].map((i) => {
      if (i >= currentDayIndex) {
        const dayIndex = i < 7 ? i : i - 7;
        const day = moment(String(dayIndex), 'e').format('dddd');
        const currentStoreHours = storeHours?.[day];

        if (
          !nextStoreOperationDate &&
          currentStoreHours?.closed !== true &&
          currentStoreHours !== undefined &&
          currentStoreHours?.start !== undefined &&
          currentStoreHours?.end !== undefined
        ) {
          if (currentDay === day) {
            if (
              moment(currentTime, 'HH:mm').isAfter(
                moment(currentStoreHours?.start, 'HH:mm'),
              ) &&
              moment(currentTime, 'HH:mm').isBefore(
                moment(currentStoreHours?.end, 'HH:mm'),
              )
            ) {
              nextStoreOperationDate = `${day}, ${twentyFourHourToTwelveHour(
                currentStoreHours?.start,
              )}`;
            }
          } else {
            nextStoreOperationDate = `${day}, ${twentyFourHourToTwelveHour(
              currentStoreHours?.start,
            )}`;
          }
        }
      }
    });

    return nextStoreOperationDate;
  }
};

const getStoreAvailability = (storeHours, vacationMode) => {
  const now = moment();
  const currentDay = now.format('dddd');
  const currentTime = now.format('HH:mm');
  const currentStoreHours = storeHours?.[currentDay];

  if (vacationMode) {
    return false;
  }

  if (storeHours !== undefined) {
    if (currentStoreHours === undefined) {
      return false;
    }

    if (
      currentStoreHours?.closed === true ||
      moment(currentStoreHours?.start, 'HH:mm').isAfter(
        moment(currentTime, 'HH:mm'),
      ) ||
      moment(currentStoreHours?.end, 'HH:mm').isBefore(
        moment(currentTime, 'HH:mm'),
      )
    ) {
      return false;
    }
  }

  return true;
};

async function openLink(url) {
  try {
    if (await InAppBrowser.isAvailable()) {
      return await InAppBrowser.open(url, {
        dismissButtonStyle: 'close',
        preferredBarTintColor: colors.primary,
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'pageSheet',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        toolbarColor: colors.primary,
        secondaryToolbarColor: 'black',
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
      });
    } else {
      return Linking.openURL(url);
    }
  } catch (err) {
    Toast({text: err.message, type: 'danger'});
  }
}

async function getDynamicLinkType(url) {
  if (url) {
    return Object.entries(dynamicLinkUrlActions).map(([urlType, urlPrefix]) => {
      if (url.match(urlPrefix)) {
        return {urlType, urlPrefix, urlSuffix: url.replace(urlPrefix, '')};
      }
    })[0];
  }
}

export {
  getStoreAvailability,
  getNextStoreOperationDate,
  openLink,
  extractStoreHoursArray,
  twentyFourHourToTwelveHour,
  getDynamicLinkType,
};
