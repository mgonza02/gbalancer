// Mock customer data for San Francisco Bay Area
const mockCustomers = [
  // Downtown San Francisco
  { id: 1, name: 'Tech Hub Store', location: { lat: 37.7749, lng: -122.4194 } },
  { id: 2, name: 'Financial District Office', location: { lat: 37.7946, lng: -122.4014 } },
  { id: 3, name: 'Union Square Retail', location: { lat: 37.7879, lng: -122.4075 } },
  { id: 4, name: 'Chinatown Market', location: { lat: 37.7941, lng: -122.4078 } },
  { id: 5, name: 'North Beach Cafe', location: { lat: 37.8067, lng: -122.4112 } },
  { id: 6, name: "Fisherman's Wharf Shop", location: { lat: 37.808, lng: -122.4177 } },
  { id: 7, name: 'Marina District Store', location: { lat: 37.8021, lng: -122.4416 } },
  { id: 8, name: 'Pacific Heights Office', location: { lat: 37.7928, lng: -122.4342 } },
  { id: 9, name: 'Nob Hill Boutique', location: { lat: 37.7919, lng: -122.4145 } },
  { id: 10, name: 'Russian Hill Shop', location: { lat: 37.8014, lng: -122.4181 } },

  // Mission District
  { id: 11, name: 'Mission Dolores Store', location: { lat: 37.7648, lng: -122.4264 } },
  { id: 12, name: 'Valencia Street Shop', location: { lat: 37.7599, lng: -122.4211 } },
  { id: 13, name: 'Mission Bay Office', location: { lat: 37.7703, lng: -122.3914 } },
  { id: 14, name: 'Potrero Hill Market', location: { lat: 37.7587, lng: -122.4068 } },
  { id: 15, name: 'Dogpatch Store', location: { lat: 37.7575, lng: -122.3892 } },
  { id: 16, name: 'Bernal Heights Shop', location: { lat: 37.7441, lng: -122.4154 } },
  { id: 17, name: 'Glen Park Office', location: { lat: 37.7337, lng: -122.4344 } },
  { id: 18, name: 'Noe Valley Boutique', location: { lat: 37.7505, lng: -122.433 } },
  { id: 19, name: 'Castro District Store', location: { lat: 37.7609, lng: -122.435 } },
  { id: 20, name: 'Duboce Triangle Shop', location: { lat: 37.7693, lng: -122.4336 } },

  // Richmond District
  { id: 21, name: 'Inner Richmond Store', location: { lat: 37.7809, lng: -122.4644 } },
  { id: 22, name: 'Outer Richmond Shop', location: { lat: 37.7756, lng: -122.4967 } },
  { id: 23, name: 'Golden Gate Park Store', location: { lat: 37.7694, lng: -122.4862 } },
  { id: 24, name: 'Presidio Heights Office', location: { lat: 37.7879, lng: -122.4556 } },
  { id: 25, name: 'Laurel Heights Shop', location: { lat: 37.7864, lng: -122.4479 } },
  { id: 26, name: 'Jordan Park Store', location: { lat: 37.7841, lng: -122.4721 } },
  { id: 27, name: 'Anza Vista Market', location: { lat: 37.7814, lng: -122.4509 } },
  { id: 28, name: 'Inner Sunset Store', location: { lat: 37.7634, lng: -122.4686 } },
  { id: 29, name: 'Outer Sunset Shop', location: { lat: 37.7549, lng: -122.4941 } },
  { id: 30, name: 'Parkside Market', location: { lat: 37.7418, lng: -122.4881 } },

  // East Bay - Oakland
  { id: 31, name: 'Downtown Oakland Office', location: { lat: 37.8044, lng: -122.2712 } },
  { id: 32, name: 'Lake Merritt Store', location: { lat: 37.8103, lng: -122.2652 } },
  { id: 33, name: 'Temescal Shop', location: { lat: 37.8311, lng: -122.2711 } },
  { id: 34, name: 'Rockridge Market', location: { lat: 37.8443, lng: -122.2519 } },
  { id: 35, name: 'Piedmont Avenue Store', location: { lat: 37.8266, lng: -122.2416 } },
  { id: 36, name: 'Fruitvale Shop', location: { lat: 37.7746, lng: -122.2241 } },
  { id: 37, name: 'East Oakland Store', location: { lat: 37.7516, lng: -122.1817 } },
  { id: 38, name: 'West Oakland Office', location: { lat: 37.8049, lng: -122.2952 } },
  { id: 39, name: 'Emeryville Store', location: { lat: 37.8313, lng: -122.2852 } },
  { id: 40, name: 'Berkeley Shop', location: { lat: 37.8715, lng: -122.273 } },

  // Peninsula
  { id: 41, name: 'Daly City Store', location: { lat: 37.7058, lng: -122.4619 } },
  { id: 42, name: 'South San Francisco Office', location: { lat: 37.6547, lng: -122.4077 } },
  { id: 43, name: 'San Bruno Shop', location: { lat: 37.6305, lng: -122.4111 } },
  { id: 44, name: 'Millbrae Market', location: { lat: 37.5985, lng: -122.3871 } },
  { id: 45, name: 'Burlingame Store', location: { lat: 37.5841, lng: -122.3661 } },
  { id: 46, name: 'San Mateo Shop', location: { lat: 37.563, lng: -122.3255 } },
  { id: 47, name: 'Foster City Office', location: { lat: 37.5585, lng: -122.2711 } },
  { id: 48, name: 'Redwood City Store', location: { lat: 37.4852, lng: -122.2364 } },
  { id: 49, name: 'Menlo Park Shop', location: { lat: 37.4419, lng: -122.143 } },
  { id: 50, name: 'Palo Alto Market', location: { lat: 37.4419, lng: -122.143 } },

  // South Bay - San Jose Area
  { id: 51, name: 'Downtown San Jose Office', location: { lat: 37.3382, lng: -121.8863 } },
  { id: 52, name: 'Willow Glen Store', location: { lat: 37.3074, lng: -121.889 } },
  { id: 53, name: 'Campbell Shop', location: { lat: 37.2871, lng: -121.9499 } },
  { id: 54, name: 'Los Gatos Market', location: { lat: 37.2358, lng: -121.9623 } },
  { id: 55, name: 'Saratoga Store', location: { lat: 37.2638, lng: -122.0231 } },
  { id: 56, name: 'Cupertino Shop', location: { lat: 37.323, lng: -122.0322 } },
  { id: 57, name: 'Sunnyvale Office', location: { lat: 37.3688, lng: -122.0363 } },
  { id: 58, name: 'Santa Clara Store', location: { lat: 37.3541, lng: -121.9552 } },
  { id: 59, name: 'Mountain View Shop', location: { lat: 37.3861, lng: -122.0839 } },
  { id: 60, name: 'Milpitas Market', location: { lat: 37.4323, lng: -121.8996 } },

  // North Bay - Marin County
  { id: 61, name: 'Sausalito Store', location: { lat: 37.859, lng: -122.4852 } },
  { id: 62, name: 'Mill Valley Shop', location: { lat: 37.9061, lng: -122.545 } },
  { id: 63, name: 'Tiburon Market', location: { lat: 37.8736, lng: -122.4564 } },
  { id: 64, name: 'Corte Madera Store', location: { lat: 37.9254, lng: -122.5258 } },
  { id: 65, name: 'San Rafael Office', location: { lat: 37.9735, lng: -122.5311 } },
  { id: 66, name: 'Novato Shop', location: { lat: 38.1074, lng: -122.5697 } },
  { id: 67, name: 'Petaluma Store', location: { lat: 38.2324, lng: -122.6367 } },
  { id: 68, name: 'Santa Rosa Market', location: { lat: 38.4404, lng: -122.7144 } },
  { id: 69, name: 'Napa Store', location: { lat: 38.2975, lng: -122.2869 } },
  { id: 70, name: 'Vallejo Shop', location: { lat: 38.1041, lng: -122.2564 } },

  // Additional scattered locations
  { id: 71, name: 'Alameda Store', location: { lat: 37.7652, lng: -122.2416 } },
  { id: 72, name: 'San Leandro Shop', location: { lat: 37.7249, lng: -122.1561 } },
  { id: 73, name: 'Hayward Market', location: { lat: 37.6688, lng: -122.0808 } },
  { id: 74, name: 'Castro Valley Store', location: { lat: 37.6941, lng: -122.0863 } },
  { id: 75, name: 'Dublin Office', location: { lat: 37.7022, lng: -121.9358 } },
  { id: 76, name: 'Pleasanton Shop', location: { lat: 37.6624, lng: -121.8746 } },
  { id: 77, name: 'Fremont Store', location: { lat: 37.5485, lng: -121.9886 } },
  { id: 78, name: 'Union City Market', location: { lat: 37.5938, lng: -122.0438 } },
  { id: 79, name: 'Newark Shop', location: { lat: 37.5297, lng: -122.0402 } },
  { id: 80, name: 'Pacifica Store', location: { lat: 37.6138, lng: -122.4869 } },

  // Additional Richmond locations
  { id: 81, name: 'El Cerrito Store', location: { lat: 37.9161, lng: -122.3108 } },
  { id: 82, name: 'Richmond Shop', location: { lat: 37.9358, lng: -122.3478 } },
  { id: 83, name: 'San Pablo Market', location: { lat: 37.9621, lng: -122.3455 } },
  { id: 84, name: 'Pinole Store', location: { lat: 38.0044, lng: -122.2989 } },
  { id: 85, name: 'Hercules Shop', location: { lat: 38.0168, lng: -122.2886 } },
  { id: 86, name: 'Martinez Store', location: { lat: 38.0194, lng: -122.1341 } },
  { id: 87, name: 'Concord Market', location: { lat: 37.978, lng: -122.0311 } },
  { id: 88, name: 'Walnut Creek Shop', location: { lat: 37.9063, lng: -122.0652 } },
  { id: 89, name: 'Lafayette Store', location: { lat: 37.8857, lng: -122.118 } },
  { id: 90, name: 'Orinda Shop', location: { lat: 37.8771, lng: -122.1797 } },

  // Final 10 locations
  { id: 91, name: 'Moraga Store', location: { lat: 37.8349, lng: -122.1297 } },
  { id: 92, name: 'Danville Market', location: { lat: 37.8216, lng: -121.9999 } },
  { id: 93, name: 'San Ramon Shop', location: { lat: 37.7799, lng: -121.978 } },
  { id: 94, name: 'Livermore Store', location: { lat: 37.6819, lng: -121.768 } },
  { id: 95, name: 'Brentwood Shop', location: { lat: 37.9318, lng: -121.6957 } },
  { id: 96, name: 'Antioch Market', location: { lat: 38.0049, lng: -121.8058 } },
  { id: 97, name: 'Pittsburg Store', location: { lat: 38.028, lng: -121.8847 } },
  { id: 98, name: 'Fairfield Shop', location: { lat: 38.2494, lng: -122.0399 } },
  { id: 99, name: 'Vacaville Store', location: { lat: 38.3566, lng: -121.9877 } },
  { id: 100, name: 'Stockton Market', location: { lat: 37.9577, lng: -121.2908 } }
];

export default mockCustomers;
