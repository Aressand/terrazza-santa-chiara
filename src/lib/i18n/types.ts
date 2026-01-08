import type { Locale } from './config';

export type PageParams = {
  params: Promise<{ lang: Locale }>;
};

export type RoomPageParams = {
  params: Promise<{ lang: Locale; slug: string }>;
};

export type Dictionary = {
  common: {
    bookNow: string;
    learnMore: string;
    backToHome: string;
    rooms: string;
    about: string;
    contact: string;
  };
  nav: {
    home: string;
    rooms: string;
    about: string;
    contact: string;
    bookNow: string;
    language: string;
  };
  home: {
    hero: {
      title: string;
      titleHighlight: string;
      subtitle: string;
      features: {
        location: string;
        terrace: string;
        experience: string;
      };
    };
    search: {
      checkIn: string;
      checkOut: string;
      guests: string;
      selectDate: string;
      selectGuests: string;
      guest: string;
      guestPlural: string;
      search: string;
      searching: string;
      findRoom: string;
      helpText: string;
    };
    rooms: {
      sectionTitle: string;
      sectionSubtitle: string;
      discoverRoom: string;
      garden: {
        title: string;
        capacity: string;
        description: string;
        alt: string;
      };
      terrace: {
        title: string;
        capacity: string;
        description: string;
        alt: string;
      };
      modern: {
        title: string;
        capacity: string;
        description: string;
        alt: string;
      };
      stoneVault: {
        title: string;
        capacity: string;
        description: string;
        alt: string;
      };
    };
    advantages: {
      sectionTitle: string;
      sectionSubtitle: string;
      location: {
        title: string;
        subtitle: string;
        description: string;
      };
      architecture: {
        title: string;
        subtitle: string;
        description: string;
      };
      outdoor: {
        title: string;
        subtitle: string;
        description: string;
      };
      modern: {
        title: string;
        subtitle: string;
        description: string;
      };
      views: {
        title: string;
        subtitle: string;
        description: string;
      };
      spiritual: {
        title: string;
        subtitle: string;
        description: string;
      };
      trust: {
        rating: string;
        reviews: string;
        testimonial: string;
        testimonialAuthor: string;
        recommended: string;
        secure: string;
      };
    };
    features: {
      panoramic: {
        title: string;
        description: string;
      };
      comfort: {
        title: string;
        description: string;
      };
      location: {
        title: string;
        description: string;
      };
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
    };
  };
  booking: {
    checkIn: string;
    checkOut: string;
    guests: string;
    totalPrice: string;
    perNight: string;
    nights: string;
  };
  footer: {
    contact: {
      title: string;
      address: string;
      phone: string;
      email: string;
    };
    accommodations: {
      title: string;
      gardenRoom: string;
      stoneVault: string;
      terrace: string;
      modern: string;
    };
    information: {
      title: string;
      aboutUs: string;
      contact: string;
      privacyPolicy: string;
      termsOfService: string;
    };
    copyright: string;
  };
  roomPage: {
    backToHome: string;
    perfectFor: string;
    guests: string;
    upTo: string;
    roomDetails: string;
    whatMakesSpecial: string;
    size: string;
    bed: string;
    beds: string;
    bathroom: string;
    kitchen: string;
    garden: string;
    terrace: string;
    view: string;
    architecture: string;
    capacity: string;
  };
  rooms: {
    garden: RoomTranslations;
    terrace: RoomTranslations;
    stoneVault: RoomTranslations;
    modern: RoomTranslations;
  };
  bookingWidget: {
    bookYourStay: string;
    from: string;
    perNight: string;
    upTo: string;
    guests: string;
    selectDates: string;
    invalidDates: string;
    minimumNights: string;
    datesUnavailable: string;
    reserve: string;
    checking: string;
    loading: string;
    youWontBeCharged: string;
    avg: string;
    night: string;
    nights: string;
    cleaningFee: string;
    total: string;
    bookingConfirmed: string;
    confirmation: string;
    guest: string;
    room: string;
    bookAnother: string;
    completeBooking: string;
  };
  about: {
    heroTitle: string;
    heroSubtitle: string;
    heroAlt: string;
    story: {
      title: string;
      paragraph1: string;
      paragraph2: string;
    };
    highlights: {
      location: {
        title: string;
        description: string;
      };
      experience: {
        title: string;
        description: string;
      };
    };
    policies: {
      title: string;
      subtitle: string;
      checkInTimes: {
        title: string;
        details: string;
      };
      cancellation: {
        title: string;
        details: string;
      };
      petPolicy: {
        title: string;
        details: string;
      };
      languages: {
        title: string;
        details: string;
      };
    };
    services: {
      title: string;
      items: string[];
    };
    checkInOut: {
      title: string;
      checkIn: string;
      checkInTime: string;
      checkOut: string;
      checkOutTime: string;
      lateArrival: string;
      lateCheckout: string;
    };
  };
  contact: {
    pageTitle: string;
    pageSubtitle: string;
    form: {
      title: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      country: string;
      selectCountry: string;
      countries: {
        italy: string;
        usa: string;
        uk: string;
        germany: string;
        france: string;
        spain: string;
        other: string;
      };
      checkInDate: string;
      checkOutDate: string;
      selectDate: string;
      guests: string;
      selectGuests: string;
      guest: string;
      guestPlural: string;
      roomPreference: string;
      selectRoom: string;
      roomOptions: {
        garden: string;
        terrace: string;
        modern: string;
        stone: string;
        any: string;
      };
      inquiryType: string;
      selectInquiry: string;
      inquiryOptions: {
        booking: string;
        availability: string;
        group: string;
        services: string;
        special: string;
        other: string;
      };
      message: string;
      messagePlaceholder: string;
      submit: string;
      submitting: string;
      required: string;
      successMessage: string;
    };
    directContact: {
      title: string;
      availability: string;
      address: {
        title: string;
        details: string;
        action: string;
      };
      phone: {
        title: string;
        details: string;
        action: string;
      };
      email: {
        title: string;
        details: string;
        action: string;
      };
      whatsapp: {
        title: string;
        details: string;
        action: string;
      };
    };
    location: {
      title: string;
      mapPlaceholder: string;
      mapAddress: string;
      directions: {
        title: string;
        trainStation: {
          from: string;
          time: string;
          description: string;
        };
        sanFrancesco: {
          from: string;
          time: string;
          description: string;
        };
        parking: {
          from: string;
          time: string;
          description: string;
        };
      };
    };
    recommendations: {
      title: string;
      restaurants: {
        title: string;
        items: string[];
      };
      hiddenGems: {
        title: string;
        items: string[];
      };
      spiritualSites: {
        title: string;
        items: string[];
      };
    };
  };
  seo: SeoTranslations;
};

export type RoomTranslations = {
  heroTitle: string;
  heroSubtitle: string;
  heroAlt: string;
  title: string;
  subtitle: string;
  description: string;
  descriptionExtra?: string;
  details: Record<string, string>;
  amenities: string[];
  gallery: Record<string, string>;
};

export type SeoPageMeta = {
  title: string;
  description: string;
};

export type SeoTranslations = {
  siteName: string;
  home: SeoPageMeta;
  about: SeoPageMeta;
  contact: SeoPageMeta;
  rooms: {
    listing: SeoPageMeta;
    garden: SeoPageMeta;
    terrace: SeoPageMeta;
    stoneVault: SeoPageMeta;
    modern: SeoPageMeta;
  };
};
