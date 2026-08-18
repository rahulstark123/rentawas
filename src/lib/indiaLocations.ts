// Cascading India Location Data (All 28 States & 8 Union Territories -> Major Cities)
export const INDIA_LOCATION_DATA: Record<string, string[]> = {
  // 28 States
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur", "Eluru", "Vizianagaram"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Tezu"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra", "Danapur", "Saharsa", "Hajipur", "Sasaram", "Dehri", "Bettiah", "Motihari", "Bagaha", "Kishanganj", "Jamalpur", "Buxar", "Jehanabad", "Aurangabad", "Lakhisarai", "Nawada", "Jamui", "Sitamarhi", "Araria", "Gopalganj", "Madhubani", "Masaurhi", "Samastipur", "Madhepura", "Supaul", "Khagaria", "Banka", "Sheohar", "Sheikhpura", "Arwal", "Rohtas", "Vaishali"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur", "Durg"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi"],
  "Haryana": ["Gurgaon (Gurugram)", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Jhajjar", "Rewari", "Palwal", "Bhiwani", "Jind", "Sirsa", "Fatehabad"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Hamirpur", "Bilaspur", "Baddi", "Manali"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih"],
  "Karnataka": ["Bengaluru (Bangalore)", "Mysuru (Mysore)", "Hubballi-Dharwad", "Mangaluru (Mangalore)", "Belagavi (Belgaum)", "Kalaburagi (Gulbarga)", "Davanagere", "Ballari", "Shivamogga", "Tumakuru"],
  "Kerala": ["Thiruvananthapuram", "Kochi (Cochin)", "Kozhikode (Calicut)", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Kannur", "Kottayam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Chhatrapati Sambhajinagar (Aurangabad)", "Kalyan-Dombivli", "Vasai-Virar", "Navi Mumbai", "Solapur", "Mira-Bhayandar", "Amravati", "Kolhapur", "Sangli"],
  "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Bishnupur", "Ukhrul"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali (SAS Nagar)", "Pathankot", "Hoshiarpur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar", "Sri Ganganagar", "Bharatpur"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan", "Pelling"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli (Trichy)", "Salem", "Tiruppur", "Erode", "Tirunelveli", "Vellore", "Thoothukudi", "Nagercoil", "Thanjavur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj (Allahabad)", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Greater Noida", "Mathura", "Ayodhya", "Jhansi", "Hapur", "Bulandshahr", "Muzaffarnagar", "Shamli", "Baghpat"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Rishikesh", "Nainital", "Almora"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Kharagpur", "Berhampore"],

  // 8 Union Territories
  "Delhi NCR": ["Delhi", "New Delhi", "Gurgaon (Gurugram)", "Noida", "Greater Noida", "Faridabad", "Ghaziabad", "Meerut", "Rohtak", "Panipat", "Karnal", "Sonipat", "Jhajjar", "Rewari", "Palwal", "Bhiwani", "Charkhi Dadri", "Mahendragarh", "Jind", "Nuh", "Hapur", "Bulandshahr", "Muzaffarnagar", "Shamli", "Baghpat", "Alwar", "Bharatpur"],
  "Chandigarh": ["Chandigarh"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Sopore"],
  "Ladakh": ["Leh", "Kargil"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Andaman & Nicobar Islands": ["Port Blair", "Havelock Island", "Diglipur"],
  "Dadra & Nagar Haveli and Daman & Diu": ["Daman", "Diu", "Silvassa"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy"],
};

// Cascading City -> Area / Locality Data Map
export const CITY_LOCALITIES_DATA: Record<string, string[]> = {
  // NCR
  "Gurgaon": ["DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5", "Cyber City", "Udyog Vihar Phase 1", "Udyog Vihar Phase 2", "Udyog Vihar Phase 3", "Udyog Vihar Phase 4", "Udyog Vihar Phase 5", "MG Road", "IFFCO Chowk", "Sushant Lok Phase 1", "Sushant Lok Phase 2", "Sushant Lok Phase 3", "South City 1", "South City 2", "Nirvana Country", "Golf Course Road", "Golf Course Extension Road", "Sohna Road", "Sector 14", "Sector 15", "Sector 17", "Sector 21", "Sector 22", "Sector 23", "Palam Vihar", "Sector 31", "Sector 40", "Sector 43", "Sector 44", "Sector 45", "Sector 46", "Sector 47", "Sector 48", "Sector 49", "Sector 50", "Sector 51", "Sector 52", "Sector 53", "Sector 54", "Sector 55", "Sector 56", "Sector 57", "Sector 61", "Sector 62", "Sector 65", "Sector 66", "Sector 67", "Sector 69", "Sector 70", "Sector 71", "Sector 82", "Sector 83", "Sector 84", "Sector 90", "New Gurgaon", "Manesar"],
  "Gurgaon (Gurugram)": ["DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5", "Cyber City", "Udyog Vihar Phase 1", "Udyog Vihar Phase 2", "Udyog Vihar Phase 3", "Udyog Vihar Phase 4", "Udyog Vihar Phase 5", "MG Road", "IFFCO Chowk", "Sushant Lok Phase 1", "Sushant Lok Phase 2", "Sushant Lok Phase 3", "South City 1", "South City 2", "Nirvana Country", "Golf Course Road", "Golf Course Extension Road", "Sohna Road", "Sector 14", "Sector 15", "Sector 17", "Sector 21", "Sector 22", "Sector 23", "Palam Vihar", "Sector 31", "Sector 40", "Sector 43", "Sector 44", "Sector 45", "Sector 46", "Sector 47", "Sector 48", "Sector 49", "Sector 50", "Sector 51", "Sector 52", "Sector 53", "Sector 54", "Sector 55", "Sector 56", "Sector 57", "Sector 61", "Sector 62", "Sector 65", "Sector 66", "Sector 67", "Sector 69", "Sector 70", "Sector 71", "Sector 82", "Sector 83", "Sector 84", "Sector 90", "New Gurgaon", "Manesar"],
  "Delhi": ["Connaught Place", "Chanakyapuri", "Vasant Vihar", "Greater Kailash 1", "Greater Kailash 2", "South Extension 1", "South Extension 2", "Lajpat Nagar", "Defense Colony", "Hauz Khas", "Green Park", "Safdarjung Enclave", "Saket", "Malviya Nagar", "Vasant Kunj", "Munirka", "RK Puram", "Dwarka Sector 1", "Dwarka Sector 2", "Dwarka Sector 3", "Dwarka Sector 4", "Dwarka Sector 5", "Dwarka Sector 6", "Dwarka Sector 7", "Dwarka Sector 8", "Dwarka Sector 9", "Dwarka Sector 10", "Dwarka Sector 11", "Dwarka Sector 12", "Dwarka Sector 13", "Dwarka Sector 14", "Dwarka Sector 18", "Dwarka Sector 21", "Dwarka Sector 22", "Dwarka Sector 23", "Rohini Sector 1", "Rohini Sector 3", "Rohini Sector 5", "Rohini Sector 7", "Rohini Sector 9", "Rohini Sector 11", "Rohini Sector 15", "Rohini Sector 18", "Rohini Sector 22", "Rohini Sector 24", "Pitampura", "Shalimar Bagh", "Model Town", "Ashok Vihar", "Kamla Nagar", "Civil Lines", "Timarpur", "Mukherjee Nagar", "GTB Nagar", "Mayur Vihar Phase 1", "Mayur Vihar Phase 2", "Mayur Vihar Phase 3", "Preet Vihar", "Laxmi Nagar", "Patparganj", "IP Extension", "Anand Vihar", "Shahdara", "Dilshad Garden", "Janakpuri", "Rajouri Garden", "Punjabi Bagh", "Paschim Vihar", "Karol Bagh", "Patel Nagar", "Rajinder Nagar", "Kirti Nagar", "Moti Nagar", "Tilak Nagar", "Uttam Nagar", "Najafgarh", "Okhla", "Kalkaji", "Chittaranjan Park", "Alaknanda", "Sarita Vihar", "Jasola"],
  "New Delhi": ["Connaught Place", "Chanakyapuri", "Khan Market", "Lajpat Nagar", "Greater Kailash (GK 1 & 2)", "Defense Colony", "Vasant Vihar", "South Extension"],
  "Noida": ["Sector 18 & Atta Market", "Sector 62 & IT Hub", "Sector 137 & Expressway", "Sector 50, 51 & Central Noida", "Sector 76, 77, 78 Spectrum", "Sector 128 & Jaypee Wish Town", "Noida Sector 15 & 16"],
  "Greater Noida": ["Pari Chowk", "Noida Extension (Gaur City)", "Omega 1 & Alpha 2", "Knowledge Park 1, 2, 3", "Yamuna Expressway Zone"],
  "Faridabad": ["Sector 15 & 16", "NIT Faridabad", "Greater Faridabad (Sector 75-89)", "Surajkund & Greenfield", "Sector 21 & 28", "Ballabhgarh", "Sector 8 & 9"],
  "Ghaziabad": ["Indirapuram", "Vaishali", "Vasundhara", "Raj Nagar & Raj Nagar Extension", "Crossings Republik", "Kaushambi", "Mohan Nagar", "Govindpuram"],
  "Meerut": ["Abu Lane", "Shastri Nagar", "Pallavpuram", "Modipuram", "Kankar Khera", "Saket", "Meerut Cantt"],
  "Rohtak": ["Model Town", "Sector 1", "Sector 2", "Sector 3", "Civil Lines", "DLF Colony"],
  "Panipat": ["Model Town", "Sector 11", "Sector 12", "Sector 25", "Huda Sector"],
  "Karnal": ["Sector 13", "Sector 14", "Model Town", "Sector 6", "Sector 7"],
  "Sonipat": ["Sector 14", "Sector 15", "Model Town", "Kundli", "Murthal"],
  
  // BIHAR
  "Patna": ["Boring Road & Anandpuri", "Kankarbagh", "Bailey Road & Raja Bazar", "Patliputra Colony", "Frazer Road & Exhibition Road", "Danapur", "Rajendra Nagar", "Anisabad", "Phulwari Sharif"],
  "Gaya": ["AP Colony", "Swarajpuri Road", "White House Compound", "Manpur", "Delha", "Bodh Gaya"],
  "Bhagalpur": ["Tilka Manjhi", "Adampur", "Khanjarpur", "Nathnagar", "Urdu Bazar", "Tatarpur"],
  "Muzaffarpur": ["Mithanpura", "Khabra", "Ahiyapur", "Brahmpura", "Ramna", "Aghoria Bazar"],
  "Purnia": ["Line Bazar", "Bhatta Bazar", "Khuskibagh", "Rambagh", "Navratan Hatta"],
  "Darbhanga": ["Kadirabad", "Donar", "Laheriasarai", "Allalpatti", "Benta"],
  "Bihar Sharif": ["Khandak Par", "Ramchandrapur", "Sohsarai", "Laheri", "Mangla Asthan"],
  "Arrah": ["Katira", "Maulabagh", "Pakri", "Nawada", "Tari Mohalla"],
  "Begusarai": ["Harrakh", "GD College Road", "Power House Chowk", "Bishanpur", "Panhas"],
  "Katihar": ["Mirchaibari", "Binodpur", "Gami Tola", "Naya Tola", "Laliya Kahi"],
  "Munger": ["Purabsarai", "Neelam Chowk", "Dilawarpur", "Lal Darwaza", "Bekapur"],
  "Chhapra": ["Salempur", "Dahiyawan", "Nai Bazar", "Ratanpura", "Bhagwan Bazar"],

  // MAHARASHTRA
  "Mumbai": ["Andheri West & Lokhandwala", "Andheri East & MIDC", "Bandra West & Pali Hill", "Juhu & Vile Parle", "Powai & Hiranandani", "Lower Parel & Worli", "Goregaon West & Malad", "Borivali West & Kandivali", "Dadar & Prabhadevi", "Colaba & Fort"],
  "Navi Mumbai": ["Vashi & Sector 17", "Nerul & Seawoods", "Kharghar & Hiranandani", "Belapur & Palm Beach", "Airoli & Kopar Khairane"],
  "Thane": ["Thane West & Ghodbunder Road", "Majiwada & Pokhran Road", "Vartak Nagar & Naupada", "Hiranandani Estate", "Kolshet Road"],
  "Pune": ["Kothrud & Karve Nagar", "Viman Nagar & Airport Road", "Hinjewadi IT Park (Phase 1-3)", "Baner & Balewadi", "Wakad & Pimple Saudagar", "Aundh & Model Colony", "Koregaon Park & Kalyani Nagar", "Hadapsar & Magarpatta City", "Kondhwa & Wanowrie"],
  
  // KARNATAKA
  "Bengaluru (Bangalore)": ["Indiranagar & 100ft Road", "Koramangala (Blocks 1-8)", "HSR Layout (Sectors 1-7)", "Whitefield & ITPL", "Electronic City (Phases 1-2)", "JP Nagar & Jayanagar", "Yelahanka & Hebbal", "Marathahalli & Bellandur", "Rajajinagar & Malleshwaram", "Sarjapur Road"],
  
  // TELANGANA & ANDHRA
  "Hyderabad": ["Banjara Hills & Jubilee Hills", "Gachibowli & Financial District", "HITECH City & Madhapur", "Kondapur & Hafeezpet", "Kukatpally & KPHB Colony", "Begumpet & Somajiguda", "Manikonda & Puppalguda", "Secunderabad & Sainikpuri"],
  "Visakhapatnam": ["Siripuram & MVP Colony", "Gajuwaka", "Waltair Uplands", "Dwaraka Nagar", "Rushikonda & IT SEZ"],
  
  // TAMIL NADU
  "Chennai": ["T. Nagar & West Mambalam", "Adyar & Besant Nagar", "Velachery & OMR IT Corridor", "Anna Nagar (East & West)", "Mylapore & Mandaveli", "Nungambakkam & Egmore", "Thiruvanmiyur & ECR"],
  
  // WEST BENGAL
  "Kolkata": ["Salt Lake (Bidhannagar Blocks)", "New Town & Rajarhat", "Park Street & Camac Street", "Ballygunge & Gariahat", "Alipore & New Alipore", "Jadavpur & Garia", "Behala & Taratala"],
  
  // GUJARAT
  "Ahmedabad": ["Satellite & Prahlad Nagar", "Bodakdev & Vastrapur", "SG Highway & Gota", "Navrangpura & CG Road", "Bopal & South Bopal", "Maninagar & Kankaria"],
  "Surat": ["Adajan", "Vesu", "Piplod", "Varachha", "Katargam", "Athwa"],
  "Vadodara": ["Alkapuri", "Akota", "Fatehgunj", "Gotri", "Manjalpur", "Sayajigunj"],
  
  // UTTAR PRADESH
  "Lucknow": ["Gomti Nagar & Extension", "Hazratganj & Lalbagh", "Aliganj & Mahanagar", "Indira Nagar", "Ashiyana & LDA Colony", "Kanpur Road & Amausi"],
  "Kanpur": ["Swaroop Nagar", "Kakadeo", "Kidwai Nagar", "Civil Lines", "PPN Market", "Shyam Nagar"],
  "Agra": ["Taj Ganj", "Sikandra", "Kamla Nagar", "Sanjay Place", "Dayal Bagh", "Sadar Bazar"],
  "Varanasi": ["Lanka", "Sigra", "Bhelupur", "Mahmoorganj", "Cantt", "Assi Ghat"],
  "Prayagraj (Allahabad)": ["Civil Lines", "Katra", "Jhusi", "Naini", "Allahpur", "Tagore Town"],
  
  // MADHYA PRADESH
  "Bhopal": ["MP Nagar Zone 1", "MP Nagar Zone 2", "Arera Colony E-1", "Arera Colony E-2", "Arera Colony E-3", "Arera Colony E-4", "Arera Colony E-5", "Arera Colony E-6", "Arera Colony E-7", "Arera Colony E-8", "Kolar Road", "Chunabhatti", "Shahpura", "Gulmohar", "Awadhpuri", "Ayodhya Bypass", "Hoshangabad Road", "Misrod", "BHEL Township", "Piplani", "Govindpura", "Indrapuri", "Anand Nagar", "Saket Nagar", "Shakti Nagar", "AIIMS Campus", "Bagh Sewaniya", "Habibganj", "Shivaji Nagar", "Tulsi Nagar", "TT Nagar", "New Market", "Roshanpura", "Char Imli", "Professor Colony", "Shyamla Hills", "Kohefiza", "Idgah Hills", "Bairagarh", "Karond", "Berasia Road", "Bhanpur", "Lalghati", "Gandhi Nagar", "Airport Road"],
  "Indore": ["Vijay Nagar", "Palasia & Old Palasia", "Saket Nagar", "Bhawarkua & AB Road", "Super Corridor", "Mahalaxmi Nagar"],
  
  // RAJASTHAN
  "Jaipur": ["Malviya Nagar & Jagatpura", "Vaishali Nagar", "C-Scheme & Ashok Nagar", "Mansarovar", "Raja Park & Tilak Nagar", "Tonk Road & Durgapura"],
  
  // PUNJAB & CHANDIGARH
  "Chandigarh": ["Sector 17 & Commercial Center", "Sector 35 & 22", "Sector 8, 9 & 10", "Sector 43 & Bus Terminal", "Industrial Area Phase 1 & 2"],
  "Ludhiana": ["Model Town", "Sarabha Nagar", "BRS Nagar", "Civil Lines", "Pakhowal Road"],
  "Amritsar": ["Ranjit Avenue", "Mall Road", "Lawrence Road", "Green Avenue", "Civil Lines"],
  
  // KERALA
  "Kochi (Cochin)": ["MG Road & Marine Drive", "Kakkanad & InfoPark", "Edappally & Lulu Mall Zone", "Vyttila & Panampilly Nagar", "Fort Kochi"],
};

// Default fallback localities for any city not explicitly mapped
export const DEFAULT_CITY_LOCALITIES = [
  "Central City Zone / Main Market",
  "North City Extension",
  "South Suburbs & Residential Hub",
  "East City Sector",
  "West Commercial Corridor",
  "IT Park & Business Hub",
];
