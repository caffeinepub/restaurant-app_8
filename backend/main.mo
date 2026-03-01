import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile
  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Data Types
  public type MenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    available : Bool;
  };

  public type Table = {
    id : Nat;
    number : Nat;
    capacity : Nat;
    occupied : Bool;
  };

  public type Reservation = {
    id : Nat;
    tableId : Nat;
    guestName : Text;
    guestCount : Nat;
    dateTime : Time.Time;
    status : Text;
  };

  public type OrderItem = {
    menuItemId : Nat;
    quantity : Nat;
  };

  public type RestaurantOrder = {
    id : Nat;
    tableId : Nat;
    items : [OrderItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Time.Time;
  };

  public type Bill = {
    id : Nat;
    orderId : Nat;
    totalAmount : Nat;
    paymentStatus : Text;
  };

  var nextMenuItemId = 12;
  var nextTableId = 0;
  var nextReservationId = 0;
  var nextOrderId = 0;
  var nextBillId = 0;

  let menuItemsMap = Map.fromIter<Nat, MenuItem>([
    (0, { id = 0; name = "French Fries"; description = "Crispy golden potato fries"; price = 6_800; category = "Starters"; available = true }),
    (1, { id = 1; name = "Spring Rolls"; description = "Crispy rolls filled with veggies"; price = 8_200; category = "Starters"; available = true }),
    (2, { id = 2; name = "Tomato Soup"; description = "Fresh tomatoes, herbs, croutons"; price = 7_500; category = "Starters"; available = true }),
    (3, { id = 3; name = "Classic Burger"; description = "Beef patty, lettuce, tomato, cheese, bun"; price = 21_900; category = "Mains"; available = true }),
    (4, { id = 4; name = "Grilled Salmon"; description = "Salmon fillet, lemon-dill sauce"; price = 23_700; category = "Mains"; available = true }),
    (5, { id = 5; name = "Chicken Alfredo"; description = "Pasta with creamy Alfredo sauce"; price = 19_900; category = "Mains"; available = true }),
    (6, { id = 6; name = "Vegetarian Pizza"; description = "Pizza with grilled vegetables"; price = 18_200; category = "Mains"; available = true }),
    (7, { id = 7; name = "Cheesecake"; description = "Classic cheesecake with strawberry"; price = 8_400; category = "Desserts"; available = true }),
    (8, { id = 8; name = "Chocolate Mousse"; description = "Rich chocolate mousse"; price = 6_900; category = "Desserts"; available = true }),
    (9, { id = 9; name = "Fruit Salad"; description = "Seasonal fruits, refreshing"; price = 5_700; category = "Desserts"; available = true }),
    (10, { id = 10; name = "Coke (0.33l)"; description = "Classic Coca-Cola"; price = 2_800; category = "Drinks"; available = true }),
    (11, { id = 11; name = "Fresh Lemonade"; description = "Homemade lemonade"; price = 3_500; category = "Drinks"; available = true })
  ].values());

  let tablesMap = Map.empty<Nat, Table>();
  let reservationsMap = Map.empty<Nat, Reservation>();
  let ordersMap = Map.empty<Nat, RestaurantOrder>();
  let billsMap = Map.empty<Nat, Bill>();

  // Menu Management (Admin only)
  public shared ({ caller }) func addMenuItem(name : Text, description : Text, price : Nat, category : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };
    let id = nextMenuItemId;
    let item : MenuItem = {
      id;
      name;
      description;
      price;
      category;
      available = true;
    };
    menuItemsMap.add(id, item);
    nextMenuItemId += 1;
    id;
  };

  public shared ({ caller }) func updateMenuItem(id : Nat, name : Text, description : Text, price : Nat, category : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    switch (menuItemsMap.get(id)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?existing) {
        let updated : MenuItem = {
          id;
          name;
          description;
          price;
          category;
          available = existing.available;
        };
        menuItemsMap.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func toggleMenuItemAvailability(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle menu item availability");
    };
    switch (menuItemsMap.get(id)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?existing) {
        let updated : MenuItem = {
          id = existing.id;
          name = existing.name;
          description = existing.description;
          price = existing.price;
          category = existing.category;
          available = not existing.available;
        };
        menuItemsMap.add(id, updated);
      };
    };
  };

  // Public: anyone (including guests) can view the menu
  public query func getMenuItems() : async [MenuItem] {
    menuItemsMap.values().toArray();
  };

  // Table Management (Admin only)
  public shared ({ caller }) func addTable(number : Nat, capacity : Nat) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add tables");
    };
    let id = nextTableId;
    let table : Table = {
      id;
      number;
      capacity;
      occupied = false;
    };
    tablesMap.add(id, table);
    nextTableId += 1;
    id;
  };

  public shared ({ caller }) func removeTable(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove tables");
    };
    switch (tablesMap.get(id)) {
      case (null) {
        Runtime.trap("Table not found");
      };
      case (?_) {
        tablesMap.remove(id);
      };
    };
  };

  public shared ({ caller }) func setTableOccupied(id : Nat, occupied : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only staff can update table status");
    };
    switch (tablesMap.get(id)) {
      case (null) {
        Runtime.trap("Table not found");
      };
      case (?existing) {
        let updated : Table = {
          id = existing.id;
          number = existing.number;
          capacity = existing.capacity;
          occupied;
        };
        tablesMap.add(id, updated);
      };
    };
  };

  // Public: anyone (including guests) can view tables to make reservations
  public query func getTables() : async [Table] {
    tablesMap.values().toArray();
  };

  // Reservation Management
  // Public: anyone (including guests) can make a reservation
  public shared func makeReservation(tableId : Nat, guestName : Text, guestCount : Nat, dateTime : Time.Time) : async Nat {
    switch (tablesMap.get(tableId)) {
      case (null) {
        Runtime.trap("Table not found");
      };
      case (?_) {
        let id = nextReservationId;
        let reservation : Reservation = {
          id;
          tableId;
          guestName;
          guestCount;
          dateTime;
          status = "reserved";
        };
        reservationsMap.add(id, reservation);
        nextReservationId += 1;
        id;
      };
    };
  };

  // Public: anyone can view reservations (needed for guests to check availability)
  public query func getReservations() : async [Reservation] {
    reservationsMap.values().toArray();
  };

  public shared ({ caller }) func updateReservationStatus(reservationId : Nat, status : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only staff can update reservation status");
    };
    switch (reservationsMap.get(reservationId)) {
      case (null) {
        Runtime.trap("Reservation not found");
      };
      case (?existing) {
        let updated : Reservation = {
          id = existing.id;
          tableId = existing.tableId;
          guestName = existing.guestName;
          guestCount = existing.guestCount;
          dateTime = existing.dateTime;
          status;
        };
        reservationsMap.add(reservationId, updated);
      };
    };
  };

  // Order Management (Staff only)
  public shared ({ caller }) func createOrder(tableId : Nat, items : [OrderItem]) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only staff can create orders");
    };
    switch (tablesMap.get(tableId)) {
      case (null) {
        Runtime.trap("Table not found");
      };
      case (?_) {
        var totalAmount = 0;
        for (item in items.vals()) {
          switch (menuItemsMap.get(item.menuItemId)) {
            case (null) { Runtime.trap("MenuItem not found") };
            case (?menuItem) {
              totalAmount += menuItem.price * item.quantity;
            };
          };
        };
        let id = nextOrderId;
        let order : RestaurantOrder = {
          id;
          tableId;
          items;
          totalAmount;
          status = "pending";
          createdAt = Time.now();
        };
        ordersMap.add(id, order);
        nextOrderId += 1;
        id;
      };
    };
  };

  // Staff only: view orders
  public query ({ caller }) func getOrders() : async [RestaurantOrder] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only staff can view orders");
    };
    ordersMap.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only staff can update orders");
    };
    switch (ordersMap.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?existing) {
        let updated : RestaurantOrder = {
          id = existing.id;
          tableId = existing.tableId;
          items = existing.items;
          totalAmount = existing.totalAmount;
          status;
          createdAt = existing.createdAt;
        };
        ordersMap.add(orderId, updated);
      };
    };
  };

  // Billing Management (Staff only)
  public shared ({ caller }) func createBill(orderId : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only staff can create bills");
    };
    switch (ordersMap.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let id = nextBillId;
        let bill : Bill = {
          id;
          orderId = order.id;
          totalAmount = order.totalAmount;
          paymentStatus = "unpaid";
        };
        billsMap.add(id, bill);
        nextBillId += 1;
        id;
      };
    };
  };

  public shared ({ caller }) func markBillPaid(billId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only staff can mark bills as paid");
    };
    switch (billsMap.get(billId)) {
      case (null) {
        Runtime.trap("Bill not found");
      };
      case (?existing) {
        let updated : Bill = {
          id = existing.id;
          orderId = existing.orderId;
          totalAmount = existing.totalAmount;
          paymentStatus = "paid";
        };
        billsMap.add(billId, updated);
      };
    };
  };

  // Staff only: view bills
  public query ({ caller }) func getBills() : async [Bill] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only staff can view bills");
    };
    billsMap.values().toArray();
  };

  // Admin Dashboard helpers (Admin only)
  public query ({ caller }) func getDashboardStats() : async {
    totalTables : Nat;
    occupiedTables : Nat;
    todayReservations : Nat;
    activeOrders : Nat;
    totalRevenue : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };
    let allTables = tablesMap.values().toArray();
    let allReservations = reservationsMap.values().toArray();
    let allOrders = ordersMap.values().toArray();
    let allBills = billsMap.values().toArray();

    let totalTables = allTables.size();
    var occupiedTables = 0;
    for (t in allTables.vals()) {
      if (t.occupied) occupiedTables += 1;
    };

    let nowNs = Time.now();
    let dayNs : Int = 86_400_000_000_000;
    let startOfDay = nowNs - (nowNs % dayNs);
    var todayReservations = 0;
    for (r in allReservations.vals()) {
      if (r.dateTime >= startOfDay and r.dateTime < startOfDay + dayNs) {
        todayReservations += 1;
      };
    };

    var activeOrders = 0;
    for (o in allOrders.vals()) {
      if (o.status == "pending" or o.status == "in-progress") {
        activeOrders += 1;
      };
    };

    var totalRevenue = 0;
    for (b in allBills.vals()) {
      if (b.paymentStatus == "paid") {
        totalRevenue += b.totalAmount;
      };
    };

    {
      totalTables;
      occupiedTables;
      todayReservations;
      activeOrders;
      totalRevenue;
    };
  };
};
