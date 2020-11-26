import moment from 'moment';

const getNextStoreOperationDate = (storeHours) => {
  const nextDay = moment().add(1, 'day').format('dddd');
  const nextDayDetails = storeHours?.[nextDay];

  if (nextDayDetails !== undefined) {
    return `${nextDay}, ${nextDayDetails.start}`;
  }
  return storeHours?.[nextDay];
};

const getStoreAvailability = (storeHours, vacationMode) => {
  const now = moment();
  const currentDay = now.format('dddd');
  const currentTime = now.format('HH:mm');
  const currentStoreHours = storeHours?.[currentDay];

  if (vacationMode) {
    return false;
  }

  if (currentStoreHours !== undefined) {
    if (currentStoreHours?.closed === true) {
      return false;
    }

    if (typeof currentStoreHours?.start === 'string') {
      if (moment(currentStoreHours.start, 'HH:mm').isBefore(currentTime)) {
        return false;
      }

      if (moment(currentStoreHours.end, 'HH:mm').isAfter(currentTime)) {
        return false;
      }
    }
  }

  return true;
};

export {getStoreAvailability, getNextStoreOperationDate};
