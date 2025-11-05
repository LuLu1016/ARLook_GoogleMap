// Test script to verify all functionality
// Run this with: node test-verification.js

import { sampleProperties, presetPrompts, filterPropertiesByMessage } from './lib/properties.ts';

console.log('=== 数据验证测试 ===\n');

// 1. 验证房源数据完整性
console.log('1. 验证房源数据完整性:');
sampleProperties.forEach((prop, index) => {
  console.log(`   房源 ${index + 1}: ${prop.name}`);
  console.log(`   - walkingDistanceToWharton: ${prop.walkingDistanceToWharton ?? '未定义'}`);
  console.log(`   - amenities: ${prop.amenities.join(', ')}`);
  console.log(`   - price: $${prop.price}`);
  console.log('');
});

// 2. 测试Wharton附近过滤（应该返回3个房源）
console.log('2. 测试Wharton附近过滤（walkingDistanceToWharton <= 10）:');
const whartonProperties = sampleProperties.filter(
  (p) => p.walkingDistanceToWharton !== undefined && p.walkingDistanceToWharton <= 10
);
console.log(`   找到 ${whartonProperties.length} 个房源:`);
whartonProperties.forEach((p) => {
  console.log(`   - ${p.name} (${p.walkingDistanceToWharton}分钟)`);
});
console.log(`   预期: 3个房源 (The Axis, evo, Cira Green)\n`);

// 3. 测试洗烘房源过滤（应该返回4个房源）
console.log('3. 测试带室内洗烘房源过滤:');
const laundryProperties = sampleProperties.filter((p) =>
  p.amenities.some((amenity) =>
    amenity.toLowerCase().includes('in-unit laundry')
  )
);
console.log(`   找到 ${laundryProperties.length} 个房源:`);
laundryProperties.forEach((p) => {
  console.log(`   - ${p.name}`);
});
console.log(`   预期: 4个房源 (The Axis, evo, Cira Green, Penn Park Residences)\n`);

// 4. 测试预算过滤（$1500-2000，应该返回3个房源）
console.log('4. 测试预算$1500-2000过滤:');
const budgetProperties = sampleProperties.filter(
  (p) => p.price >= 1500 && p.price <= 2000
);
console.log(`   找到 ${budgetProperties.length} 个房源:`);
budgetProperties.forEach((p) => {
  console.log(`   - ${p.name} ($${p.price})`);
});
console.log(`   预期: 3个房源 (evo: $1650, The Axis: $1800, Penn Park: $1950)\n`);

// 5. 测试filterPropertiesByMessage函数
console.log('5. 测试filterPropertiesByMessage函数:');

// 测试Wharton
const whartonFiltered = filterPropertiesByMessage('Wharton附近学生公寓', sampleProperties);
console.log(`   "Wharton附近学生公寓" -> ${whartonFiltered.length}个房源`);
console.log(`   预期: 3个房源\n`);

// 测试洗烘
const laundryFiltered = filterPropertiesByMessage('带室内洗烘房源', sampleProperties);
console.log(`   "带室内洗烘房源" -> ${laundryFiltered.length}个房源`);
console.log(`   预期: 4个房源\n`);

// 测试预算
const budgetFiltered = filterPropertiesByMessage('预算$1500-2000', sampleProperties);
console.log(`   "预算$1500-2000" -> ${budgetFiltered.length}个房源`);
console.log(`   预期: 3个房源\n`);

// 测试预设提示词
console.log('6. 测试预设提示词过滤:');
presetPrompts.forEach((prompt) => {
  const filtered = sampleProperties.filter(prompt.filter);
  console.log(`   "${prompt.text}" -> ${filtered.length}个房源`);
});
console.log('');

console.log('=== 测试完成 ===');

