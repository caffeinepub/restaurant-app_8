import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MenuItem {
    id: bigint;
    name: string;
    description: string;
    available: boolean;
    category: string;
    price: bigint;
}
export type Time = bigint;
export interface Table {
    id: bigint;
    occupied: boolean;
    number: bigint;
    capacity: bigint;
}
export interface OrderItem {
    quantity: bigint;
    menuItemId: bigint;
}
export interface Reservation {
    id: bigint;
    status: string;
    guestCount: bigint;
    tableId: bigint;
    guestName: string;
    dateTime: Time;
}
export interface Bill {
    id: bigint;
    paymentStatus: string;
    orderId: bigint;
    totalAmount: bigint;
}
export interface RestaurantOrder {
    id: bigint;
    status: string;
    createdAt: Time;
    tableId: bigint;
    totalAmount: bigint;
    items: Array<OrderItem>;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(name: string, description: string, price: bigint, category: string): Promise<bigint>;
    addTable(number: bigint, capacity: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBill(orderId: bigint): Promise<bigint>;
    createOrder(tableId: bigint, items: Array<OrderItem>): Promise<bigint>;
    getBills(): Promise<Array<Bill>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        totalTables: bigint;
        todayReservations: bigint;
        activeOrders: bigint;
        totalRevenue: bigint;
        occupiedTables: bigint;
    }>;
    getMenuItems(): Promise<Array<MenuItem>>;
    getOrders(): Promise<Array<RestaurantOrder>>;
    getReservations(): Promise<Array<Reservation>>;
    getTables(): Promise<Array<Table>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    makeReservation(tableId: bigint, guestName: string, guestCount: bigint, dateTime: Time): Promise<bigint>;
    markBillPaid(billId: bigint): Promise<void>;
    removeTable(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setTableOccupied(id: bigint, occupied: boolean): Promise<void>;
    toggleMenuItemAvailability(id: bigint): Promise<void>;
    updateMenuItem(id: bigint, name: string, description: string, price: bigint, category: string): Promise<void>;
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
    updateReservationStatus(reservationId: bigint, status: string): Promise<void>;
}
