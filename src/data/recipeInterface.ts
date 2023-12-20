export interface Recipe {
  id: string;
  imageurl: string;
  alt: string;
  title: string;
  date: string;
  category: string;
  description: string;
  longDescription?: string;
  time: string;
  portions: number;
  tips?: string;
  chef?: string;
  tipsurl?: string;
  vintipsnavn?: string;
  vintipsUrl?: string;
  ingredients: Array<{
    title: string;
    ingredients: Array<{
      quantity: string;
      name: string;
    }>;
  }>;
  steps: Array<{
    title: string;
    description: string;
  }>;
  images: Array<{
    orientation: string;
    url: string;
    alt: string;
  }>;
  keywords?: string[];
}
