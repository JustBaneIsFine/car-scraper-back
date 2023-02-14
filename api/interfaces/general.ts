export interface CarObject {
  CarName: string;
  CarPrice: string;
  CarFuel: string;
  CarKM: string;
  CarCC: string;
  CarYear: string;
  CarHref: string;
  Id: string;
  ImageUrl: string;
}

export interface CarsCollectionPage {
  carsPage: CarObject[];
}

export interface CarsCollectionWebsite {
  success: boolean;
  gotAllPages: boolean;
  collection: CarsCollectionPage[];
}

export interface ResultingCollection {
  kupujem: CarsCollectionPage;
  polovni: CarsCollectionPage;
}

export interface CarValues {
  carMake: string;
  carModel: string;
  carYearStart: string;
  carYearEnd: string;
}

export interface CarRequestValues extends CarValues {
  polovniNum: string;
  kupujemNum: string;
}
