import moment from 'moment';

const getNextStoreOperationDate = (storeHours) => {
  const now = moment();
  const currentDayIndex = Number(now.format('e'));
  let nextStoreOperationDate = null;
  let closestDayIndex = 0;

  if (storeHours) {
    Object.entries(storeHours).map(([day, dayDetails], index) => {
      let dayIndex = Number(moment(day, 'dddd').format('e'));

      if (dayIndex < currentDayIndex) {
        dayIndex += currentDayIndex;
      }

      if (
        dayIndex !== currentDayIndex &&
        Math.abs(dayIndex - currentDayIndex) <
          Math.abs(closestDayIndex - currentDayIndex)
      ) {
        if (
          dayDetails !== undefined &&
          dayDetails?.closed !== true &&
          !nextStoreOperationDate
        ) {
          closestDayIndex = dayIndex;

          nextStoreOperationDate = `${day}, ${moment(
            dayDetails.start,
            'HH:mm',
          ).format('hh:mm A')}`;
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

  if (currentStoreHours !== undefined) {
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

export {getStoreAvailability, getNextStoreOperationDate};
