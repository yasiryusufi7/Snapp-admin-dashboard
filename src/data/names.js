export const MALE_FIRST = [
  'Ahmad', 'Mohammad', 'Omar', 'Farid', 'Hamid', 'Karim', 'Rahim', 'Nasir', 'Zabiullah', 'Jawed',
  'Samiullah', 'Khalid', 'Wali', 'Qais', 'Mustafa', 'Tahir', 'Yousuf', 'Daud', 'Farhad', 'Bashir',
  'Habib', 'Nader', 'Parviz', 'Shakib', 'Tamim', 'Waheed', 'Zia', 'Sardar', 'Gulzar', 'Rahmat',
  'Baryalai', 'Omid', 'Burhan', 'Aziz', 'Shaheer', 'Faisal', 'Murtaza', 'Ehsan', 'Rashid', 'Imran',
]

export const FEMALE_FIRST = [
  'Fatima', 'Maryam', 'Zohra', 'Laila', 'Shakila', 'Mina', 'Farzana', 'Nadia', 'Somaya', 'Khadija',
  'Roya', 'Sadaf', 'Wajiha', 'Habiba', 'Arezo', 'Freshta', 'Nilofar', 'Suraya', 'Zarghona', 'Anisa',
  'Atifa', 'Breshna', 'Spozhmai', 'Homaira', 'Marzia', 'Sharifa', 'Najiba', 'Palwasha', 'Sitara', 'Nargis',
  'Hosai', 'Zainab', 'Mahsa', 'Kowsar', 'Roghayya', 'Hasina', 'Sima', 'Malika', 'Ziba', 'Adeela',
]

export const LAST_NAMES = [
  'Ahmadzai', 'Karimi', 'Rahimi', 'Habibi', 'Sultani', 'Noori', 'Stanikzai', 'Popal', 'Durrani', 'Ghilzai',
  'Wardak', 'Sherzai', 'Osmani', 'Zadran', 'Safi', 'Kakar', 'Nazari', 'Rahmani', 'Ahmadi', 'Yousafzai',
  'Haqyar', 'Tareen', 'Zaland', 'Hussaini', 'Wafa', 'Nawabi', 'Baryalai', 'Sharifi', 'Frogh', 'Kamal',
  'Stanik', 'Mansoori', 'Rasuli', 'Hashimi', 'Sarwari', 'Qadiri', 'Sadat', 'Azizi', 'Taqwa', 'Habib',
]

export const STREETS = [
  'Jade Maiwand', 'Chicken Street', 'Flower Street', 'Jalalabad Road', 'Airport Road',
  'Darul Aman Road', 'Bagh-e-Bala Road', 'Shahr-e-Naw Road', 'Pul-e-Surkh Road', 'Deh Mazang Road',
  'Karte Parwan Road', 'Char Suq Street', 'Zarnigar Road', 'Shor Bazaar Street', 'Nawabad Road',
  'Ghuranjal Road', 'Aino Mina Road', 'Mirwais Mina Street', 'Behsud Road', 'Taimani Street',
]

export const VEHICLE_POOL = [
  { brand: 'Toyota Corolla', type: 'economy', year: 2022 },
  { brand: 'Volkswagen Passat', type: 'executive', year: 2023 },
  { brand: 'Hyundai Elantra', type: 'economy', year: 2021 },
  { brand: 'Renault Megane', type: 'economy', year: 2022 },
  { brand: 'Fiat Egea', type: 'economy', year: 2020 },
  { brand: 'Škoda Octavia', type: 'economy', year: 2023 },
  { brand: 'Ford Focus', type: 'economy', year: 2021 },
  { brand: 'Mercedes E-Class', type: 'executive', year: 2024 },
  { brand: 'Tesla Model 3', type: 'eco', year: 2024 },
  { brand: 'Hyundai Ioniq 5', type: 'eco', year: 2023 },
  { brand: 'Kia Carens', type: 'xl', year: 2022 },
  { brand: 'Toyota Avanza', type: 'xl', year: 2021 },
  { brand: 'Volkswagen Caddy', type: 'xl', year: 2022 },
  { brand: 'Renault Zoe', type: 'eco', year: 2023 },
  { brand: 'Opel Insignia', type: 'executive', year: 2020 },
]

export const COLORS = [
  { name: 'White', hex: '#f8fafc' },
  { name: 'Black', hex: '#1e293b' },
  { name: 'Silver', hex: '#cbd5e1' },
  { name: 'Burgundy', hex: '#7f1d1d' },
  { name: 'Navy', hex: '#1e3a8a' },
]

export const ADMIN_NAMES = [
  { name: 'Ahmad Karimi', role: 'Super Admin', email: 'ahmad.karimi@snapp.com' },
  { name: 'Farid Rahimi', role: 'Operations Manager', email: 'farid.rahimi@snapp.com' },
  { name: 'Maryam Noori', role: 'Finance Manager', email: 'maryam.noori@snapp.com' },
  { name: 'Habib Safi', role: 'Dispatcher', email: 'habib.safi@snapp.com' },
]

export const COMPLAINT_DESCRIPTIONS = [
  'Driver took an unusually long route and the fare was much higher than estimated.',
  'Passenger left a phone in the vehicle; driver did not respond to contact attempts.',
  'Driver was not wearing a seatbelt and drove at high speed during the trip.',
  'The card was charged twice for a single trip.',
  'Aircraft avoided pickup even though the location pin was correct.',
  'Driver smoked inside the cabin during the trip.',
  'Passenger was verbally abusive to the driver.',
  'The estimated fare did not match the final fare charged.',
  'Driver was unresponsive when I called about a lost wallet.',
  'The vehicle did not match the vehicle shown in the app.',
  'Driver dropped me off at a different location than the destination.',
  'I was overcharged for the airport pickup surcharge.',
  'Driver refused to take me with a service animal.',
  'The air conditioning was broken during a 40-minute trip.',
  'Passenger failed to show up for a scheduled booking without cancelling.',
  'Driver requested cash payment on top of the in-app fare.',
  'The app showed the driver was 2 minutes away but the wait took 20 minutes.',
  'Driver terminated the trip early and demanded cash.',
]

export const CANCEL_REASONS = [
  'Passenger no-show',
  'Driver cancelled — vehicle issue',
  'Passenger changed mind',
  'Driver cancelled — too far',
  'Passenger cancelled — wait too long',
  'Driver cancelled — personal emergency',
  'Payment failed',
]