const DataValidator = require('./data_validator');

const testRecords = [
    {
        firstName: 'john',
        lastName: 'DOE',
        email: 'JOHN.DOE@EXAMPLE.COM',
        phone: ' +1 234 567 890 ',
        taxId: ' abc12345 ',
        dob: '1990-01-01'
    },
    {
        firstName: '',
        lastName: 'Smith',
        email: 'invalid-email',
        phone: '123',
        taxId: '',
        dob: '1995-05-15'
    }
];

testRecords.forEach((record, index) => {
    console.log(`Testing record ${index + 1}:`);
    const result = DataValidator.process(record);
    console.log('Valid:', result.isValid);
    console.log('Cleaned Data:', JSON.stringify(result.data, null, 2));
    if (result.errors.length > 0) {
        console.log('Errors:', result.errors);
    }
    console.log('---');
});
