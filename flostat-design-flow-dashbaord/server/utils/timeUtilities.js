export function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

export function addSecondsToTime(timeString, secondsToAdd) {
  // Split HH:mm into hours and minutes
  const [hours, minutes] = timeString.split(":").map(Number);

  // Convert to total seconds
  let totalSeconds = hours * 3600 + minutes * 60 + secondsToAdd;

  // Compute new hours, minutes, seconds
  const newHours = Math.floor(totalSeconds / 3600) % 24;
  const newMinutes = Math.floor((totalSeconds % 3600) / 60);
  const newSeconds = totalSeconds % 60;

  // Format as HH:mm:ss
  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2,"0")}:${String(newSeconds).padStart(2,"0")}`;
}


