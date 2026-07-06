/**
 * Get current date in month/date/year format
 * @returns {string} Date in format MM/DD/YYYY
 */
export function getFormattedDate() {
    const today = new Date();
    //.padStart is used to ensure that month and date are always two digits (e.g., "01" for January, "09" for the 9th day)
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    
    return `${month}/${date}/${year}`;
}

