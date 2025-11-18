import { Timestamp } from "firebase/firestore";

export interface Order {
  id: string;
  title: string;
  date: Timestamp;
  serviceId: string;
  client: string;
  placeName: string;
  placeAddress: string;
  placeCoordinates: { lat: number; lng: number };

  timeline: {
    scheduled: {
      meet: Timestamp;
      departure: Timestamp;
      showStart: Timestamp;
      showEnd: Timestamp;
      returningHome: Timestamp;
    };
    actual?: {
      meet?: Timestamp;
      departure?: Timestamp;
      showStart?: Timestamp;
      showEnd?: Timestamp;
      returningHome?: Timestamp;
    };
  };

  participants: {
    employees: {
      employeeId: string;
      name?: string;
      role: "artist" | "pirotech" | "tech" | "driver" | "manager";
      rateId: string;
      rateValue?: number;
      hoursWorked: number;
      totalSalary: number;
      confirmed?: boolean;
      attended?: boolean;
    }[];
  };

  financials: {
    totalPrice: number;
    totalSalaries: number; // сумма из participants
    expenses?: number; // дополнительные расходы
    profit?: number; // вычисляемое: totalPrice - totalSalaries - expenses
  };

  status: "planned" | "confirmed" | "in_progress" | "done" | "cancelled";
  createdBy: string;
  notes?: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}
