import { SimpleLinearRegression as SLR } from "ml-regression-simple-linear";

// Fill missing days (forward fill)
export function fillMissingDays(data, startDate, endDate) {
  const result = [];
  let lastKnown = { vehicle: 0, food: 0, energy: 0 };

  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const key = current.toISOString().split("T")[0];

    const dayData = data.find(d => d.date === key);

    if (dayData) lastKnown = dayData;

    result.push({
      date: key,
      vehicle: lastKnown.vehicle || 0,
      food: lastKnown.food || 0,
      energy: lastKnown.energy || 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return result;
}

// Predict next N days
export function predictNextDaysML(filledData, days = 7) {
  if (filledData.length < 3) return [];

  const predictions = [];
  const len = filledData.length;

  const indices = filledData.map((_, i) => i + 1);

  const vehicleReg = new SLR(indices, filledData.map(d => d.vehicle));
  const foodReg = new SLR(indices, filledData.map(d => d.food));
  const energyReg = new SLR(indices, filledData.map(d => d.energy));

  const lastDate = new Date(filledData[len - 1].date);

  for (let i = 1; i <= days; i++) {
    const nextIndex = len + i;

    const vehicle = Math.max(0, vehicleReg.predict(nextIndex));
    const food = Math.max(0, foodReg.predict(nextIndex));
    const energy = Math.max(0, energyReg.predict(nextIndex));

    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);

    predictions.push({
      date: nextDate.toISOString().split("T")[0],
      vehicle,
      food,
      energy,
      total: vehicle + food + energy,
    });
  }

  return predictions;
}
