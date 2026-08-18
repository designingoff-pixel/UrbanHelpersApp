// ─────────────────────────────────────────────────────────────────────────────
// Urban Helpers — Services catalogue
// All 10 categories × their sub-services with pricing and description.
// Used by ServicesDashboardScreen → ServiceCategoryScreen → ServiceDetailScreen.
// ─────────────────────────────────────────────────────────────────────────────

export interface SubService {
  id: string;
  name: string;
  price: string;          // e.g. "₹299"
  duration: string;       // e.g. "60 min"
  description: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;           // Ionicons name
  gradient: [string, string];
  accent: string;         // single colour for badges / highlights
  tagline: string;
  subServices: SubService[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "ro",
    name: "RO Service",
    icon: "water",
    gradient: ["#0284c7", "#38bdf8"],
    accent: "#38bdf8",
    tagline: "Pure water, every drop",
    subServices: [
      { id: "ro-filter",   name: "Filter Change",          price: "₹399",  duration: "45 min",  description: "Replace all RO filters for cleaner, safer water.", popular: true },
      { id: "ro-clean",    name: "RO Cleaning",            price: "₹299",  duration: "60 min",  description: "Deep clean of membrane and housing to remove scale." },
      { id: "ro-new",      name: "New RO System",          price: "₹5,999",duration: "2 hrs",   description: "Supply and install a new branded RO purifier of your choice." },
      { id: "ro-monthly",  name: "Monthly Maintenance",    price: "₹199",  duration: "30 min",  description: "Scheduled monthly check-up and filter inspection." },
      { id: "ro-shift",    name: "RO Shifting",            price: "₹349",  duration: "90 min",  description: "Safe dismantling, transport and reinstallation at new address." },
      { id: "ro-leak",     name: "Leakage Repair",         price: "₹249",  duration: "45 min",  description: "Diagnose and fix pipe or fitting leaks in your RO unit." },
      { id: "ro-tds",      name: "TDS Checking",           price: "₹99",   duration: "20 min",  description: "On-site TDS meter reading with a written report." },
    ],
  },
  {
    id: "pet",
    name: "Pet Care",
    icon: "paw",
    gradient: ["#db2777", "#f472b6"],
    accent: "#f472b6",
    tagline: "Love them the right way",
    subServices: [
      { id: "pet-bath",    name: "Pet Bathing",            price: "₹399",  duration: "45 min",  description: "Gentle shampoo bath, blow-dry and ear cleaning for your pet." },
      { id: "pet-groom",   name: "Pet Grooming",           price: "₹599",  duration: "90 min",  description: "Full groom: cut, trim, nail clipping and de-shedding.", popular: true },
      { id: "pet-walk",    name: "Pet Walking",            price: "₹149",  duration: "30 min",  description: "Trained walker takes your dog for a safe, GPS-tracked walk." },
      { id: "pet-train",   name: "Pet Training",           price: "₹999",  duration: "60 min",  description: "One-on-one obedience and behaviour training session." },
      { id: "pet-hostel",  name: "Pet Hostel",             price: "₹499/day", duration: "24 hrs", description: "Safe, caring overnight stay with regular updates." },
      { id: "pet-hospital",name: "Pet Hospital",           price: "₹199",  duration: "Varies",  description: "Connect with a verified vet for consultation at home or clinic." },
      { id: "pet-emer",    name: "Pet Emergency",          price: "₹0 (call)", duration: "ASAP", description: "24/7 emergency vet helpline and ambulance coordination." },
    ],
  },
  {
    id: "pest",
    name: "Pest Control",
    icon: "bug",
    gradient: ["#15803d", "#4ade80"],
    accent: "#4ade80",
    tagline: "Your home, pest-free",
    subServices: [
      { id: "pest-cock",   name: "Anti-Cockroach",         price: "₹499",  duration: "60 min",  description: "Gel bait treatment in kitchen, bathrooms and drains.", popular: true },
      { id: "pest-liz",    name: "Anti-Lizard",            price: "₹399",  duration: "45 min",  description: "Repellent spray on walls, corners and behind furniture." },
      { id: "pest-term",   name: "Anti-Termite",           price: "₹1,499",duration: "3 hrs",   description: "Soil and wood treatment with 1-year warranty." },
      { id: "pest-rodent", name: "Anti-Rodent",            price: "₹699",  duration: "90 min",  description: "Trap placement and seal entry points to block rodents." },
      { id: "pest-bug",    name: "Anti-Bed Bug",           price: "₹999",  duration: "2 hrs",   description: "Heat + chemical treatment for mattresses and furniture." },
      { id: "pest-snake",  name: "Snake Rescue",           price: "₹299",  duration: "30 min",  description: "Trained rescuers safely capture and relocate snakes." },
    ],
  },
  {
    id: "hort",
    name: "Horticulture",
    icon: "leaf",
    gradient: ["#065f46", "#34d399"],
    accent: "#34d399",
    tagline: "Grow green, live better",
    subServices: [
      { id: "hort-setup",  name: "Terrace Garden Setup",  price: "₹2,999",duration: "Half day", description: "End-to-end terrace garden design and installation.", popular: true },
      { id: "hort-plant",  name: "Plantation",            price: "₹999",  duration: "2 hrs",   description: "Seasonal plants sourced and planted in your terrace pots." },
      { id: "hort-manure", name: "Organic Manures",       price: "₹499",  duration: "1 hr",    description: "Supply and apply organic compost for healthy soil." },
      { id: "hort-advice", name: "Planting Advice",       price: "₹199",  duration: "45 min",  description: "Expert consultation on what to grow, how and when." },
      { id: "hort-med",    name: "Medicinal Plants Setup",price: "₹1,499",duration: "3 hrs",   description: "Curated medicinal plant garden with care guide." },
      { id: "hort-shed",   name: "Plantation Shed Setup", price: "₹3,999",duration: "1 day",   description: "Install a shaded enclosure to protect your plants." },
      { id: "hort-veg",    name: "Vegetable Pot Setup",   price: "₹799",  duration: "2 hrs",   description: "Start growing your own vegetables in pots today." },
    ],
  },
  {
    id: "delivery",
    name: "Delivery",
    icon: "bicycle",
    gradient: ["#7c3aed", "#a78bfa"],
    accent: "#a78bfa",
    tagline: "Everything at your doorstep",
    subServices: [
      { id: "del-med",     name: "Medicine Delivery",     price: "₹29",   duration: "2 hrs",   description: "Prescription and OTC medicines from nearby pharmacies.", popular: true },
      { id: "del-veg",     name: "Vegetable Delivery",    price: "₹19",   duration: "3 hrs",   description: "Fresh farm vegetables delivered same day." },
      { id: "del-food",    name: "Food Delivery",         price: "₹39",   duration: "45 min",  description: "Hot meals from restaurants near you." },
      { id: "del-grocery", name: "Grocery Delivery",      price: "₹29",   duration: "2 hrs",   description: "Full grocery run from your preferred supermarket." },
      { id: "del-equip",   name: "Equipment Delivery",    price: "₹99",   duration: "Same day",description: "Medical or household equipment rental and delivery." },
      { id: "del-diet",    name: "Diet Food Delivery",    price: "₹149",  duration: "Daily",   description: "Customised diet meal plans delivered fresh daily." },
    ],
  },
  {
    id: "appliance",
    name: "Appliance Cleaning",
    icon: "flash",
    gradient: ["#b45309", "#fbbf24"],
    accent: "#fbbf24",
    tagline: "Clean machines, clean home",
    subServices: [
      { id: "app-bed",     name: "Bed Cleaning",          price: "₹699",  duration: "90 min",  description: "Vacuuming, steam and disinfection of mattress and frame." },
      { id: "app-sofa",    name: "Sofa Cleaning",         price: "₹799",  duration: "2 hrs",   description: "Dry foam cleaning and stain removal for all sofa types.", popular: true },
      { id: "app-curtain", name: "Curtain Cleaning",      price: "₹499",  duration: "1 hr",    description: "On-site steam clean or pick-up-and-drop service." },
      { id: "app-wardrobe",name: "Wardrobe Cleaning",     price: "₹399",  duration: "60 min",  description: "Interior wipe-down and organisation of wardrobe shelves." },
      { id: "app-dining",  name: "Dining Table Cleaning", price: "₹299",  duration: "30 min",  description: "Deep clean and polish for all table materials." },
      { id: "app-fridge",  name: "Refrigerator Cleaning", price: "₹499",  duration: "60 min",  description: "Full interior and exterior fridge cleaning and deodorising." },
      { id: "app-ac",      name: "AC Cleaning",           price: "₹599",  duration: "90 min",  description: "Filter wash, coil clean and gas check for peak efficiency." },
      { id: "app-fan",     name: "Fan Cleaning",          price: "₹149",  duration: "20 min",  description: "Blade and motor housing clean for all fan types." },
      { id: "app-tv",      name: "TV Cleaning",           price: "₹199",  duration: "20 min",  description: "Screen and cabinet clean using anti-static cloths." },
      { id: "app-stove",   name: "Gas Stove Cleaning",    price: "₹299",  duration: "45 min",  description: "Burner decarbonisation and full cooktop deep clean." },
      { id: "app-chimney", name: "Chimney Cleaning",      price: "₹699",  duration: "90 min",  description: "Filter and duct clean to restore full suction power." },
    ],
  },
  {
    id: "homecare",
    name: "Home Care",
    icon: "home",
    gradient: ["#0e7490", "#22d3ee"],
    accent: "#22d3ee",
    tagline: "Caring hands at home",
    subServices: [
      { id: "hc-day",      name: "Day Care",              price: "₹599/day", duration: "8 hrs",  description: "Trained caregiver for children or elderly during day hours." },
      { id: "hc-maid",     name: "Maid Service",          price: "₹399/day", duration: "4 hrs",  description: "Verified house help for cooking, cleaning and daily chores.", popular: true },
      { id: "hc-nurse",    name: "Nurse Care",            price: "₹1,199/day","duration": "12 hrs", description: "Qualified nurse for post-operative or chronic care at home." },
      { id: "hc-elderly",  name: "Elderly Care",          price: "₹799/day", duration: "8 hrs",  description: "Compassionate full-day care for senior family members." },
    ],
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: "shield-checkmark",
    gradient: ["#1e3a8a", "#60a5fa"],
    accent: "#60a5fa",
    tagline: "Protect what matters most",
    subServices: [
      { id: "ins-health",  name: "Health Insurance",      price: "Get quote", duration: "15 min", description: "Compare and buy the best health cover for your family.", popular: true },
      { id: "ins-life",    name: "Life Insurance",        price: "Get quote", duration: "15 min", description: "Secure your family's future with a term or endowment plan." },
      { id: "ins-vehicle", name: "Vehicle Insurance",     price: "Get quote", duration: "10 min", description: "Renew or buy car and two-wheeler insurance instantly." },
      { id: "ins-general", name: "General Insurance",    price: "Get quote", duration: "10 min", description: "Home, travel and other general insurance plans." },
    ],
  },
  {
    id: "emergency",
    name: "Emergency",
    icon: "alert-circle",
    gradient: ["#7f1d1d", "#ef4444"],
    accent: "#ef4444",
    tagline: "Help in seconds, not minutes",
    subServices: [
      { id: "em-amb",      name: "Ambulance Service",     price: "₹0 (call)", duration: "ASAP",  description: "24/7 ambulance dispatch with trained paramedics.", popular: true },
      { id: "em-road",     name: "Roadside Assistance",   price: "₹499",  duration: "30 min",  description: "Towing, flat tyre, battery jump and fuel delivery." },
      { id: "em-women",    name: "Women Helpline",        price: "₹0 (call)", duration: "ASAP",  description: "Immediate safety response and counselling for women." },
      { id: "em-child",    name: "Child Protection",      price: "₹0 (call)", duration: "ASAP",  description: "24/7 support for child safety and protection issues." },
      { id: "em-precaution",name:"Precaution Service",   price: "₹199",  duration: "1 hr",    description: "Home safety audit and precautionary measures installation." },
    ],
  },
  {
    id: "cleaning",
    name: "Home Cleaning",
    icon: "sparkles",
    gradient: ["#00bcd4", "#0097a7"],
    accent: "#00bcd4",
    tagline: "Spotless home, happy life",
    subServices: [
      { id: "cl-full",     name: "Full Home Cleaning",    price: "₹1,999",duration: "5 hrs",   description: "Complete top-to-bottom cleaning of your entire home.", popular: true },
      { id: "cl-kitchen",  name: "Kitchen Cleaning",      price: "₹699",  duration: "2 hrs",   description: "Counters, hob, sink, chimney and cabinet deep clean." },
      { id: "cl-restroom", name: "Restroom Cleaning",     price: "₹399",  duration: "60 min",  description: "Tile scrub, commode, basin and mirror sanitisation." },
      { id: "cl-tank",     name: "Water Tank Cleaning",   price: "₹799",  duration: "2 hrs",   description: "Sump or overhead tank draining, scrub and chlorination." },
      { id: "cl-appliance",name: "Appliances Cleaning",  price: "₹599",  duration: "90 min",  description: "Exterior clean of all kitchen and household appliances." },
      { id: "cl-window",   name: "Window Cleaning",       price: "₹349",  duration: "60 min",  description: "Inside and outside window glass and frame cleaning." },
      { id: "cl-fan",      name: "Fan Cleaning",          price: "₹149",  duration: "20 min",  description: "All ceiling and wall fans cleaned including blades." },
      { id: "cl-sofa",     name: "Sofa Cleaning",         price: "₹799",  duration: "2 hrs",   description: "Shampooing, stain removal and deodorising." },
      { id: "cl-floor",    name: "Floor Cleaning",        price: "₹499",  duration: "90 min",  description: "Machine scrub and mop for all floor types." },
      { id: "cl-sanitary", name: "Sanitary & Waste Mgmt", price: "₹299",  duration: "45 min",  description: "Hygienic waste collection and sanitation of bins and drains." },
      { id: "cl-disinfect",name: "Disinfectant Service",  price: "₹999",  duration: "2 hrs",   description: "EPA-grade disinfectant spray throughout the home." },
    ],
  },
];
