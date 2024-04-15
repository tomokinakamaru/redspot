export type ValueChange<T> = {
  oldValue?: T;
  newValue?: T;
};

export type NbformatChange = {
  key: string;
  oldValue?: number;
  newValue?: number;
};
