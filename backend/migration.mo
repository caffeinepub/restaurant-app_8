import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type MenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    available : Bool;
  };

  type OldActor = {
    nextMenuItemId : Nat;
    menuItemsMap : Map.Map<Nat, MenuItem>;
  };

  type NewActor = {
    nextMenuItemId : Nat;
    menuItemsMap : Map.Map<Nat, MenuItem>;
  };

  public func run(old : OldActor) : NewActor {
    let newMenuItems = Map.fromIter<Nat, MenuItem>([
      (0, { id = 0; name = "French Fries"; description = "Crispy golden potato fries"; price = 6_800; category = "Starters"; available = true }),
      (1, { id = 1; name = "Spring Rolls"; description = "Crispy rolls filled with veggies"; price = 8_200; category = "Starters"; available = true }),
      (2, { id = 2; name = "Tomato Soup"; description = "Fresh tomatoes, herbs, croutons"; price = 7_500; category = "Starters"; available = true }),
      (3, { id = 3; name = "Classic Burger"; description = "Beef patty, lettuce, tomato, cheese, bun"; price = 21_900; category = "Mains"; available = true }),
      (4, { id = 4; name = "Grilled Salmon"; description = "Salmon fillet, lemon-dill sauce"; price = 23_700; category = "Mains"; available = true }),
      (5, { id = 5; name = "Chicken Alfredo"; description = "Pasta with creamy Alfredo sauce"; price = 19_900; category = "Mains"; available = true }),
      (6, { id = 6; name = "Vegetarian Pizza"; description = "Pizza with grilled vegetables"; price = 18_200; category = "Mains"; available = true }),
      (7, { id = 7; name = "Cheesecake"; description = "Classic cheesecake with strawberry sauce"; price = 8_400; category = "Desserts"; available = true }),
      (8, { id = 8; name = "Chocolate Mousse"; description = "Rich chocolate mousse"; price = 6_900; category = "Desserts"; available = true }),
      (9, { id = 9; name = "Fruit Salad"; description = "Seasonal fruits, refreshing"; price = 5_700; category = "Desserts"; available = true }),
      (10, { id = 10; name = "Coke (0.33l)"; description = "Classic Coca-Cola"; price = 2_800; category = "Drinks"; available = true }),
      (11, { id = 11; name = "Fresh Lemonade"; description = "Homemade lemonade"; price = 3_500; category = "Drinks"; available = true })
    ].values());
    {
      old with
      nextMenuItemId = 12;
      menuItemsMap = newMenuItems;
    };
  };
};
