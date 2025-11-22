/**
 * Formats a 24-hour time string to 12-hour format with AM/PM
 * @param time24 - Time string in "HH:mm" or "HH:mm:ss" format
 * @returns Formatted time string in "hh:mm AM/PM" format
 */
export const formatTimeTo12H = (time24: string | undefined | null): string => {
    if (!time24) return "";

    try {
        // Handle both "HH:mm" and "HH:mm:ss" formats
        const parts = time24.split(":");
        if (parts.length < 2) return time24;

        const hours = parseInt(parts[0], 10);
        const minutes = parts[1];

        if (isNaN(hours) || hours < 0 || hours > 23) return time24;

        const period = hours >= 12 ? "PM" : "AM";
        const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

        return `${hours12}:${minutes} ${period}`;
    } catch (error) {
        console.error("Error formatting time:", error);
        return time24;
    }
};

/**
 * Formats a 12-hour time string to 24-hour format
 * @param time12 - Time string in "hh:mm AM/PM" format
 * @returns Formatted time string in "HH:mm" format
 */
export const formatTimeTo24H = (time12: string | undefined | null): string => {
    if (!time12) return "";

    try {
        const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return time12;

        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();

        if (period === "PM" && hours !== 12) {
            hours += 12;
        } else if (period === "AM" && hours === 12) {
            hours = 0;
        }

        return `${hours.toString().padStart(2, "0")}:${minutes}`;
    } catch (error) {
        console.error("Error formatting time:", error);
        return time12;
    }
};
