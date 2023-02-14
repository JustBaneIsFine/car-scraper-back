import { CarValues } from '../interfaces/general';
import FinalDataCollection from '../assets/FinalDataCollection.json';

export default function nameTransformer(data: CarValues) {
  const foundObject = FinalDataCollection.find(
    (carObject) => carObject.name === data.carMake
  );

  const foundModel = foundObject?.models.find(
    (modelObject) => modelObject.name === data.carModel
  );

  return {
    polovni: {
      makeId: foundObject?.altPol,
      modelId: foundModel?.altPol,
      yearStart: data.carYearStart,
      yearEnd: data.carYearEnd,
    },
    kupujem: {
      makeId: foundObject?.altKup,
      modelId: foundModel?.altKup,
      yearStart: data.carYearStart,
      yearEnd: data.carYearEnd,
    },
  };
}
