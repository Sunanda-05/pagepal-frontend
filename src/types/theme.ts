export interface Theme {
  id: string;
  name: string;
  description: string;
  image: string;
  colors: {
    [key: string]: string;
  };
}
