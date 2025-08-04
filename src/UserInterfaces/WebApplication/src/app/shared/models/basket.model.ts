export interface BasketItem {
  quantity: number;
  color: string;
  price: number;
  productId: string;
  productName: string;
}

export interface Basket {
  username: string;
  items: BasketItem[];
  totalPrice?: number;
}

export interface BasketResponse {
  basket: Basket;
}

export interface CreateBasketRequest {
  Cart: {
    UserName: string;
    Items: BasketItem[];
  };
}

export interface BasketCheckoutDto {
  userName: string;
  customerId: string;
  totalPrice: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  addressLine: string;
  country: string;
  state: string;
  zipCode: string;
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  paymentMethod: number;
}

export interface CheckoutBasketRequest {
  BasketCheckoutDto: BasketCheckoutDto;
}

export interface BasketApiResponse {
  Cart: {
    UserName: string;
    Items: BasketItem[];
  };
}
