import { create } from "zustand";

interface SliderState {
  currentSlides: Record<string, number>;
  setCurrentSlide: (sliderName: string, slideIndex: number) => void;
  initializeSlide: (sliderName: string) => void;
}

export const useSlide = create<SliderState>((set) => ({
  currentSlides: {},
  setCurrentSlide: (sliderName, slideIndex) =>
    set((state) => ({
      currentSlides: {
        ...state.currentSlides,
        [sliderName]: slideIndex,
      },
    })),

  initializeSlide: (sliderName) =>
    set((state) => ({
      currentSlides: {
        ...state.currentSlides,
        [sliderName]: state.currentSlides[sliderName] ?? 0,
      },
    })),
}));
