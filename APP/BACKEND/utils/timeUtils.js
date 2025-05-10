/**
 * Utility functions for time formatting and conversion
 */

/**
 * Convert UTC time to IST (Indian Standard Time)
 * IST is UTC+5:30
 * 
 * @param {Date|string} utcTime - UTC time as Date object or ISO string
 * @returns {string} - Formatted IST time string in ISO format
 */
const convertToIST = (utcTime) => {
    const date = typeof utcTime === 'string' ? new Date(utcTime) : utcTime;

    // IST offset is UTC+5:30 (330 minutes)
    const istOffsetMinutes = 330;

    // Add the offset to get IST time
    const istTime = new Date(date.getTime() + (istOffsetMinutes * 60 * 1000));

    return istTime.toISOString();
};

/**
 * Get current time in IST
 * 
 * @returns {string} - Current IST time in ISO format
 */
const getCurrentIST = () => {
    return convertToIST(new Date());
};

/**
 * Format a date for display in IST
 * 
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} - Formatted date string
 */
const formatISTDate = (date, includeTime = true) => {
    const istDate = typeof date === 'string' ? new Date(convertToIST(date)) : new Date(convertToIST(date));

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Kolkata'
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = true;
    }

    return new Intl.DateTimeFormat('en-IN', options).format(istDate);
};

module.exports = {
    convertToIST,
    getCurrentIST,
    formatISTDate
};