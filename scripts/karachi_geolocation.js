/**
 * Karachi Geolocation Utility
 * Provides lookup for Karachi areas, districts, and coordinates
 */

const fs = require('fs');
const path = require('path');

// Load geolocation data
const geodataPath = path.join(__dirname, '../data/karachi_geolocations.json');
let karachiData = null;

function loadKarachiData() {
    if (!karachiData) {
        try {
            karachiData = JSON.parse(fs.readFileSync(geodataPath, 'utf8'));
        } catch (error) {
            console.error('Failed to load Karachi geolocation data:', error.message);
            return null;
        }
    }
    return karachiData;
}

/**
 * Find district by name
 * @param {string} name - District name to search
 * @returns {Object|null} District object or null
 */
function findDistrict(name) {
    const data = loadKarachiData();
    if (!data) return null;
    
    const searchName = name.toLowerCase();
    
    for (const district of data.districts) {
        if (district.name.toLowerCase().includes(searchName) ||
            district.alternateNames.some(n => n.toLowerCase().includes(searchName))) {
            return district;
        }
    }
    return null;
}

/**
 * Find area by name
 * @param {string} name - Area name to search
 * @returns {Object|null} Area object or null
 */
function findArea(name) {
    const data = loadKarachiData();
    if (!data) return null;
    
    const searchName = name.toLowerCase();
    
    for (const area of data.areas) {
        if (area.name.toLowerCase().includes(searchName) ||
            area.keywords.some(k => k.toLowerCase().includes(searchName))) {
            return area;
        }
    }
    return null;
}

/**
 * Extract location from address string
 * @param {string} address - Full address string
 * @returns {Object} { district, area, coordinates, districtName, areaName }
 */
function extractLocation(address) {
    const data = loadKarachiData();
    if (!data) return { found: false };
    
    const addressLower = address.toLowerCase();
    let foundArea = null;
    let foundDistrict = null;
    
    // Search for areas first (more specific)
    for (const area of data.areas) {
        for (const keyword of area.keywords) {
            if (addressLower.includes(keyword.toLowerCase())) {
                foundArea = area;
                // Find the district this area belongs to
                foundDistrict = data.districts.find(d => d.name === area.district);
                break;
            }
        }
        if (foundArea) break;
    }
    
    // If no area found, search for districts
    if (!foundDistrict) {
        for (const district of data.districts) {
            if (district.name.toLowerCase().includes(addressLower) ||
                district.alternateNames.some(n => addressLower.includes(n.toLowerCase()))) {
                foundDistrict = district;
                break;
            }
            // Also check town names
            for (const town of district.towns) {
                if (addressLower.includes(town.toLowerCase())) {
                    foundDistrict = district;
                    break;
                }
            }
            if (foundDistrict) break;
        }
    }
    
    return {
        found: !!(foundArea || foundDistrict),
        area: foundArea,
        district: foundDistrict,
        areaName: foundArea?.name || null,
        districtName: foundDistrict?.name || (foundArea?.district || null),
        coordinates: foundArea?.coordinates || foundDistrict?.coordinates || data.coordinates
    };
}

/**
 * Get all areas in a district
 * @param {string} districtName - Name of district
 * @returns {Array} Array of areas in the district
 */
function getAreasInDistrict(districtName) {
    const data = loadKarachiData();
    if (!data) return [];
    
    const district = findDistrict(districtName);
    if (!district) return [];
    
    return data.areas.filter(area => area.district === district.name);
}

/**
 * Get all districts
 * @returns {Array} Array of all districts
 */
function getAllDistricts() {
    const data = loadKarachiData();
    return data?.districts || [];
}

/**
 * Get all areas
 * @returns {Array} Array of all areas
 */
function getAllAreas() {
    const data = loadKarachiData();
    return data?.areas || [];
}

module.exports = {
    findDistrict,
    findArea,
    extractLocation,
    getAreasInDistrict,
    getAllDistricts,
    getAllAreas,
    karachiData: () => loadKarachiData()
};

// Test if run directly
if (require.main === module) {
    const data = loadKarachiData();
    console.log('Karachi Geolocation Data Loaded:');
    console.log(`- City: ${data.city}`);
    console.log(`- Districts: ${data.districts.length}`);
    console.log(`- Areas: ${data.areas.length}`);
    console.log('');
    
    // Test extraction
    const testAddresses = [
        'House No 247/B2 Future Colony Landhi, Karachi',
        'H #517 Street 408 Alfalal Colony',
        'Zia Colony, Korangi',
        'Gulshan-e-Iqbal, Karachi',
        'Clifton, Karachi'
    ];
    
    console.log('Testing address extraction:');
    for (const addr of testAddresses) {
        const result = extractLocation(addr);
        console.log(`\n"${addr}"`);
        console.log(`  -> District: ${result.districtName || 'Not found'}`);
        console.log(`  -> Area: ${result.areaName || 'Not found'}`);
        console.log(`  -> Coords: ${result.coordinates?.latitude}, ${result.coordinates?.longitude}`);
    }
}
