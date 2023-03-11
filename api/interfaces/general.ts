import { Session } from 'express-session';
import { WithId } from 'mongodb';

export interface UserBasic {
  username: string;
  password: string;
  email: string;
}

export interface CarObject {
  CarName: string;
  CarPrice: string;
  CarFuel: string;
  CarKM: string;
  CarCC: string;
  CarYear: string;
  Href: string;
  Id: string;
  ImageUrl: string;
  PostedBy: string;
}

export interface CarValues {
  carMake: string;
  carModel: string;
  carYearStart: string;
  carYearEnd: string;
}

export interface UserUnsafeFull {
  username: string;
  password: string;
  email: string;
  joinDate: string;
  favorites: Array<CarObject>;
  posts: Array<CarObject>;
  userImageUrl: string;
}

export interface UserSafeFull {
  username: string;
  email: string;
  joinDate: string;
  favorites: Array<CarObject>;
  posts: Array<CarObject>;
  userImageUrl: string;
  [key: string]: string | boolean | Array<CarObject>;
}

export interface UserUnsafeDB extends WithId<Document> {
  username: string;
  password: string;
  email: string;
  joinDate: string;
  favorites: Array<CarObject>;
  posts: Array<CarObject>;
  userImageUrl: string;
}

export interface SessionUserDB extends WithId<Document> {
  username: string;
  loggedIn: boolean;
}

export interface CarCollectionFull {
  websiteCars: CarObject[];
}

export interface CarCollectionUser {
  userCars: CarObject[];
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

export interface CarRequestValues extends CarValues {
  polovniNum: string;
  kupujemNum: string;
}

export interface CustomSession extends Session {
  user?: UserSafeFull;
}

export interface DocUpdateData {
  collection: 'Users' | 'UserCars';
  documentToChange: {
    keyType: 'username' | 'Id' | 'posts.Id' | 'favorites.Id'; // ex. 'if updating user data it would be: {username : } or {posts.id : }'
    keySearchValue: string;
  };
  dataToChange: any;
}
