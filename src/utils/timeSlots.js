export const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 4; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            const formattedMinute = minute.toString().padStart(2, '0');
            slots.push(`${displayHour.toString().padStart(2, '0')}:${formattedMinute} ${period}`);
        }
    }
    return slots;
};