import moment from 'moment';

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
              nextStoreOperationDate = `${day}, ${moment(
                currentStoreHours?.start,
                'HH:mm',
              ).format('h:mm A')}`;
            }
          } else {
            nextStoreOperationDate = `${day}, ${moment(
              currentStoreHours?.start,
              'HH:mm',
            ).format('h:mm A')}`;
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

export {getStoreAvailability, getNextStoreOperationDate};
