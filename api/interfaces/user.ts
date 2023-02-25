import { WithId } from 'mongodb';

export interface UserInterface {
  username: string;
  password: string;
  email: string;
}

export interface UserInterfaceDB extends WithId<Document> {
  username: string;
  password: string;
  email: string;
}

export interface SessionUserDB extends WithId<Document> {
  username: string;
  email: string;
}
