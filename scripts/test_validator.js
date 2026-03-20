/**
 * Test Suite for DataValidator
 * Validates cleaning and validation logic for employee records.
 */

const DataValidator = require('./data_validator');

let passedTests = 0;
let failedTests = 0;

/**
 * Asserts that a condition is true.
 * @param {boolean} condition - The condition to test.
 * @param {string} testName - Name of the test for reporting.
 */
function assert(condition, testName) {
    if (condition) {
        console.log(`✓ ${testName}`);
        passedTests++;
    } else {
        console.error(`✗ ${testName}`);
        failedTests++;
    }
}

/**
 * Asserts deep equality between two objects.
 * @param {Object} actual - Actual result.
 * @param {Object} expected - Expected result.
 * @param {string} testName - Name of the test for reporting.
 */
function assertDeepEqual(actual, expected, testName) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    assert(actualStr === expectedStr, testName);
    if (actualStr !== expectedStr) {
        console.error(`  Expected: ${expectedStr}`);
        console.error(`  Actual: ${actualStr}`);
    }
}

console.log('=== DataValidator Tests ===\n');

// Test cleanName function
console.log('--- cleanName Tests ---');
assert(
    DataValidator.cleanName('john DOE') === 'John Doe',
    'cleanName capitalizes each word correctly'
);
assert(
    DataValidator.cleanName('  mary   jane  ') === 'Mary Jane',
    'cleanName trims and normalizes whitespace'
);
assert(
    DataValidator.cleanName('') === '',
    'cleanName returns empty string for empty input'
);
assert(
    DataValidator.cleanName('No record') === '',
    'cleanName returns empty string for "No record"'
);
assert(
    DataValidator.cleanName(null) === '',
    'cleanName returns empty string for null'
);

// Test validateEmail function
console.log('\n--- validateEmail Tests ---');
assert(
    DataValidator.validateEmail('test@example.com') === true,
    'validateEmail accepts valid email'
);
assert(
    DataValidator.validateEmail('TEST@EXAMPLE.COM') === true,
    'validateEmail accepts uppercase email (case insensitive)'
);
assert(
    DataValidator.validateEmail('invalid-email') === false,
    'validateEmail rejects email without @'
);
assert(
    DataValidator.validateEmail('') === false,
    'validateEmail rejects empty string'
);
assert(
    DataValidator.validateEmail('No record') === false,
    'validateEmail rejects "No record"'
);
assert(
    DataValidator.validateEmail(null) === false,
    'validateEmail rejects null'
);

// Test validatePhone function
console.log('\n--- validatePhone Tests ---');
assert(
    DataValidator.validatePhone('03001234567') === true,
    'validatePhone accepts local Pakistan format (0XXXXXXXXXX)'
);
assert(
    DataValidator.validatePhone('+923001234567') === true,
    'validatePhone accepts international format (+92XXXXXXXXXX)'
);
assert(
    DataValidator.validatePhone('0300-1234567') === true,
    'validatePhone accepts dashed format (0XXX-XXXXXXX)'
);
assert(
    DataValidator.validatePhone('+1234567890') === true,
    'validatePhone accepts international E.164 format'
);
assert(
    DataValidator.validatePhone('123') === false,
    'validatePhone rejects too short number'
);
assert(
    DataValidator.validatePhone('') === false,
    'validatePhone rejects empty string'
);
assert(
    DataValidator.validatePhone('No record') === false,
    'validatePhone rejects "No record"'
);
assert(
    DataValidator.validatePhone(null) === false,
    'validatePhone rejects null'
);

// Test process function - valid record
console.log('\n--- process Function Tests ---');

const validRecord = {
    assigned_id: 'EMP001',
    name: 'john DOE',
    father_husband_name: 'jane DOE',
    date_of_birth: '01.01.1990',
    gender: 'Male',
    cnic: '12345-1234567-1',
    designation: 'Nurse',
    contact_1: '03001234567',
    district: 'Karachi',
    religion: 'Islam',
    marital_status: 'Single',
    age: '30',
    payment_mode: 'Bank Transfer',
    languages: 'English, Urdu'
};

const validResult = DataValidator.process(validRecord);
assert(validResult.isValid === true, 'process returns isValid=true for valid record');
assert(validResult.errors.length === 0, 'process returns empty errors for valid record');
assertDeepEqual(
    validResult.data.name,
    'John Doe',
    'process cleans name correctly'
);
assert(
    validResult.data.contact_1 === '03001234567',
    'process preserves phone number'
);

// Test process function - invalid record (missing name)
const invalidRecordNoName = {
    assigned_id: 'EMP002',
    name: '',
    father_husband_name: 'Jane Doe',
    contact_1: '03001234567'
};

const invalidResult = DataValidator.process(invalidRecordNoName);
assert(invalidResult.isValid === false, 'process returns isValid=false when name is missing');
assert(
    invalidResult.errors.includes('Name is required'),
    'process includes "Name is required" error'
);

// Test process function - invalid phone
const invalidRecordBadPhone = {
    assigned_id: 'EMP003',
    name: 'John Doe',
    father_husband_name: 'Jane Doe',
    contact_1: '123'
};

const badPhoneResult = DataValidator.process(invalidRecordBadPhone);
assert(badPhoneResult.isValid === false, 'process returns isValid=false for invalid phone');
assert(
    badPhoneResult.errors.includes('Invalid phone format for Contact 1'),
    'process includes "Invalid phone format" error'
);

// Test process function - "No record" values
const recordWithNoRecord = {
    assigned_id: 'EMP004',
    name: 'John Doe',
    father_husband_name: 'No record',
    date_of_birth: 'No record',
    contact_1: 'No record'
};

const noRecordResult = DataValidator.process(recordWithNoRecord);
assert(noRecordResult.isValid === true, 'process handles "No record" values');
assert(
    noRecordResult.data.father_husband_name === null,
    'process converts "No record" to null for optional fields'
);

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Total: ${passedTests + failedTests}`);

if (failedTests > 0) {
    console.error('\nSome tests failed!');
    process.exit(1);
} else {
    console.log('\nAll tests passed!');
    process.exit(0);
}
