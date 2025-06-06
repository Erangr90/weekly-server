type Allergy = {
  id: number;
  name: string;
};

type Ingredient = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: string;
  allergies?: Allergy[];
  ingredients?: Ingredient[];
};
