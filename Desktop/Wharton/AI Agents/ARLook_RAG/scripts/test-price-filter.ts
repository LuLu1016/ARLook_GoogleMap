// Test script to verify price parsing and filtering
const testCases = [
  { input: '$1,900–$2,400', expected: 2150, name: 'The Accolade' },
  { input: '$2,299–$3,869', expected: 3084, name: 'Arrive University City' },
  { input: '$2,340–$4,949', expected: 3645, name: 'The Chestnut' },
  { input: '$2,599–$5,200', expected: 3900, name: '3737 Chestnut' },
  { input: '$2,499–$3,962', expected: 3231, name: 'Domus' },
];

function parsePriceRange(priceStr: string): number {
  if (!priceStr || priceStr === '-') return 2000;
  
  const cleaned = priceStr.replace(/\$/g, '').replace(/\+/g, '');
  
  const rangeMatch = cleaned.match(/([\d,]+)\s*[–-]\s*([\d,]+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1].replace(/,/g, ''));
    const max = parseInt(rangeMatch[2].replace(/,/g, ''));
    return Math.round((min + max) / 2);
  }
  
  const singleMatch = cleaned.match(/([\d,]+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1].replace(/,/g, ''));
  }
  
  return 2000;
}

console.log('🧪 Testing Price Parsing:');
console.log('='.repeat(60));

testCases.forEach(test => {
  const result = parsePriceRange(test.input);
  const passed = result === test.expected;
  console.log(`${passed ? '✅' : '❌'} ${test.name}`);
  console.log(`   Input: "${test.input}"`);
  console.log(`   Expected: $${test.expected}, Got: $${result}`);
  if (!passed) {
    console.log(`   ⚠️ MISMATCH!`);
  }
  console.log();
});

console.log('\n🧪 Testing Filter Logic:');
console.log('='.repeat(60));

// Simulate properties
const properties = [
  { name: 'The Accolade', price: 2150 },
  { name: 'Arrive University City', price: 3084 },
  { name: 'The Chestnut', price: 3645 },
  { name: '3737 Chestnut', price: 3900 },
  { name: 'Domus', price: 3231 },
];

const filterTests = [
  { maxPrice: 2500, expected: ['The Accolade'], desc: 'maxPrice $2500 should include Accolade ($2150)' },
  { maxPrice: 3000, expected: ['The Accolade'], desc: 'maxPrice $3000 should include Accolade ($2150)' },
  { maxPrice: 3200, expected: ['The Accolade', 'Arrive University City'], desc: 'maxPrice $3200 should include Accolade and Arrive' },
  { maxPrice: 2400, expected: ['The Accolade'], desc: 'maxPrice $2400 should include Accolade ($2150)' },
];

filterTests.forEach(test => {
  const filtered = properties.filter(p => p.price <= test.maxPrice);
  const filteredNames = filtered.map(p => p.name);
  const passed = JSON.stringify(filteredNames.sort()) === JSON.stringify(test.expected.sort());
  
  console.log(`${passed ? '✅' : '❌'} ${test.desc}`);
  console.log(`   Filter: maxPrice <= $${test.maxPrice}`);
  console.log(`   Expected: ${test.expected.join(', ')}`);
  console.log(`   Got: ${filteredNames.join(', ')}`);
  if (!passed) {
    console.log(`   ⚠️ MISMATCH!`);
  }
  console.log();
});

console.log('\n📊 Summary:');
console.log('All tests completed. Check results above.');

