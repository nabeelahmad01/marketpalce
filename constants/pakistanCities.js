// Pakistan Cities and Areas Data
export const PAKISTAN_CITIES = [
  // Karachi
  {
    city: 'Karachi',
    province: 'Sindh',
    areas: [
      'Gulshan-e-Iqbal', 'Clifton', 'Defence (DHA)', 'Nazimabad', 'North Nazimabad',
      'Gulistan-e-Johar', 'Malir', 'Korangi', 'Landhi', 'Shah Faisal Colony',
      'Saddar', 'II Chundrigar Road', 'Tariq Road', 'Bahadurabad', 'PECHS',
      'Shahrah-e-Faisal', 'University Road', 'Gulberg', 'Johar Town', 'Model Colony',
      'Federal B Area', 'Liaquatabad', 'Buffer Zone', 'Surjani Town', 'New Karachi'
    ]
  },
  
  // Lahore
  {
    city: 'Lahore',
    province: 'Punjab',
    areas: [
      'Defence (DHA)', 'Gulberg', 'Model Town', 'Johar Town', 'Cantt',
      'Anarkali', 'Mall Road', 'Liberty Market', 'MM Alam Road', 'Fortress Stadium',
      'Wapda Town', 'Town Ship', 'Faisal Town', 'Iqbal Town', 'Samanabad',
      'Garden Town', 'Muslim Town', 'Allama Iqbal Town', 'Valencia Town', 'Lake City',
      'Bahria Town', 'EME Society', 'PIA Society', 'Cavalry Ground', 'Thokar Niaz Baig'
    ]
  },
  
  // Islamabad
  {
    city: 'Islamabad',
    province: 'ICT',
    areas: [
      'F-6', 'F-7', 'F-8', 'F-10', 'F-11', 'G-6', 'G-7', 'G-8', 'G-9', 'G-10', 'G-11',
      'I-8', 'I-9', 'I-10', 'E-7', 'E-11', 'Blue Area', 'Diplomatic Enclave',
      'Bahria Town', 'DHA', 'PWD', 'CDA', 'Margalla Hills', 'Sector H-13'
    ]
  },
  
  // Rawalpindi
  {
    city: 'Rawalpindi',
    province: 'Punjab',
    areas: [
      'Saddar', 'Committee Chowk', 'Raja Bazaar', 'Cantt', 'Westridge',
      'Satellite Town', 'Chaklala', 'Bahria Town', 'DHA', 'PWD',
      'Commercial Market', 'Bank Road', 'Murree Road', 'Mall Road', 'Kalma Chowk'
    ]
  },
  
  // Faisalabad
  {
    city: 'Faisalabad',
    province: 'Punjab',
    areas: [
      'Ghulam Muhammad Abad', 'People\'s Colony', 'Samanabad', 'Millat Town',
      'Susan Road', 'Civil Lines', 'Kotwali Road', 'D Ground', 'Jhang Road',
      'Sargodha Road', 'Jaranwala Road', 'Canal Road', 'Satiana Road'
    ]
  },
  
  // Multan
  {
    city: 'Multan',
    province: 'Punjab',
    areas: [
      'Cantt', 'Gulgasht Colony', 'Bosan Road', 'MDA Chowk', 'New Multan',
      'Shah Rukn-e-Alam Colony', 'Officers Colony', 'Mumtazabad', 'Vehari Road'
    ]
  },
  
  // Peshawar
  {
    city: 'Peshawar',
    province: 'KPK',
    areas: [
      'University Town', 'Hayatabad', 'Board Bazaar', 'Saddar', 'Cantt',
      'Ring Road', 'GT Road', 'Charsadda Road', 'Jamrud Road', 'Kohat Road'
    ]
  },
  
  // Quetta
  {
    city: 'Quetta',
    province: 'Balochistan',
    areas: [
      'Cantt', 'Satellite Town', 'Samungli Road', 'Jinnah Road', 'Brewery Road',
      'Shahrah-e-Iqbal', 'Double Road', 'Alamdar Road', 'Zarghoon Road'
    ]
  },
  
  // Sialkot
  {
    city: 'Sialkot',
    province: 'Punjab',
    areas: [
      'Cantt', 'Civil Lines', 'Allama Iqbal Road', 'Paris Road', 'Kutchery Road',
      'Rangpura', 'Hajipura', 'Uggoki', 'Aimanabad'
    ]
  },
  
  // Gujranwala
  {
    city: 'Gujranwala',
    province: 'Punjab',
    areas: [
      'Civil Lines', 'Satellite Town', 'Model Town', 'Peoples Colony',
      'GT Road', 'Sialkot Road', 'Wazirabad Road', 'Lahore Road'
    ]
  }
];

export const searchCities = (query) => {
  if (!query || query.length < 2) return [];
  
  const results = [];
  const queryLower = query.toLowerCase();
  
  PAKISTAN_CITIES.forEach(cityData => {
    // Search in city names
    if (cityData.city.toLowerCase().includes(queryLower)) {
      results.push({
        type: 'city',
        name: cityData.city,
        province: cityData.province,
        fullName: `${cityData.city}, ${cityData.province}`
      });
    }
    
    // Search in areas
    cityData.areas.forEach(area => {
      if (area.toLowerCase().includes(queryLower)) {
        results.push({
          type: 'area',
          name: area,
          city: cityData.city,
          province: cityData.province,
          fullName: `${area}, ${cityData.city}, ${cityData.province}`
        });
      }
    });
  });
  
  return results.slice(0, 10); // Return top 10 results
};
