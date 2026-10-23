import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TourKey =
  | "home"
  | "flows"
  | "landing"
  | "landing_builder"
  | "simulate"
  | "channels"
  | "appearance";

interface TourStore {
  seenTours: Record<TourKey, boolean>;
  hasSeenTour: (key: TourKey) => boolean;
  markTourSeen: (key: TourKey) => void;
  resetTour: (key: TourKey) => void;
  resetAllTours: () => void;
}

export const useTourStore = create<TourStore>()(
  persist(
    (set, get) => ({
      seenTours: {} as Record<TourKey, boolean>,

      hasSeenTour: (key: TourKey) => Boolean(get().seenTours[key]),

      markTourSeen: (key: TourKey) =>
        set((state) => ({
          seenTours: { ...state.seenTours, [key]: true },
        })),

      resetTour: (key: TourKey) =>
        set((state) => ({
          seenTours: { ...state.seenTours, [key]: false },
        })),

      resetAllTours: () => set({ seenTours: {} as Record<TourKey, boolean> }),
    }),
    {
      name: "nexo_tour_state",
    },
  ),
);
