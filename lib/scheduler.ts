import { addWeeks, differenceInWeeks, format, addMonths, addDays, differenceInDays } from 'date-fns';

export type Species = 'Dog' | 'Cat';
export type BreedSize = 'Small' | 'Large' | 'N/A';

export interface Visit {
  id: string;
  targetDate: Date;
  formattedDate: string; 
  vaccines: string[];
  notes?: string;
  isBooster?: boolean; 
  ageDisplay: string; 
}

// Helper to push weekend dates to the following Monday
function skipWeekend(date: Date): Date {
  const day = date.getDay();
  if (day === 6) return addDays(date, 2); // Saturday -> Monday
  if (day === 0) return addDays(date, 1); // Sunday -> Monday
  return date;
}

export function generateSchedule(
  dob: Date,
  firstVisit: Date,
  species: Species,
  breedSize: BreedSize
): Visit[] {
  const visits: Visit[] = [];
  const ageAtFirstVisit = differenceInWeeks(firstVisit, dob);
  
  let currentVisitDate = firstVisit;
  let currentAgeWeeks = ageAtFirstVisit;
  const exactDaysOldAtFirstVisit = differenceInDays(firstVisit, dob);

  if (species === 'Dog') {
    let rabiesGiven = false;
    let leptoCount = 0;
    let dappCount = 1;

    // --- VISIT 1 EVALUATION (CANINE) ---
    const initialCanineVaccines = ['DAPP #1', 'Bordetella'];
    
    if (exactDaysOldAtFirstVisit >= 84) {
      initialCanineVaccines.push('Rabies (1 Yr)', 'Leptospirosis #1');
      rabiesGiven = true;
      leptoCount = 1;
    }

    visits.push({
      id: 'v1',
      targetDate: currentVisitDate,
      formattedDate: `Actual: ${format(currentVisitDate, 'MM/dd/yyyy (EEEE)')}`,
      vaccines: initialCanineVaccines,
      notes: 'Initial Visit.',
      isBooster: false,
      ageDisplay: `${currentAgeWeeks} Weeks`
    });

    // --- DYNAMIC INTERVAL CALCULATOR (CANINE) ---
    const intervals: number[] = [];
    let simulatedAge = ageAtFirstVisit;

    while (simulatedAge < 12) {
      const distance = 12 - simulatedAge;
      if (distance <= 2) { 
        intervals.push(2); 
        simulatedAge += 2; 
      } else if (distance === 4) { 
        intervals.push(4); 
        simulatedAge += 4; 
      } else { 
        intervals.push(3); 
        simulatedAge += 3; 
      }
    }

    while (simulatedAge < 16) {
      const distance = 16 - simulatedAge;
      if (distance >= 4) { intervals.push(4); simulatedAge += 4; } 
      else { intervals.push(3); simulatedAge += 3; }
    }

    // --- CANINE BOOSTER GENERATOR ---
    intervals.forEach((intervalWeeks, index) => {
      currentVisitDate = addWeeks(currentVisitDate, intervalWeeks);
      currentAgeWeeks += intervalWeeks;
      dappCount++;

      const isFinalVisit = currentAgeWeeks >= 16;
      const currentVaccines = [`DAPP #${dappCount}`];

      // Rabies Legal Buffer Logic
      if (currentAgeWeeks >= 12 && !rabiesGiven) {
        const exactDaysOld = differenceInDays(currentVisitDate, dob);
        const earliestArrival = exactDaysOld - 3;
        
        if (earliestArrival < 84) {
          const daysToBuffer = 84 - earliestArrival;
          currentVisitDate = addDays(currentVisitDate, daysToBuffer);
        }

        currentVaccines.push('Rabies (1 Yr)');
        rabiesGiven = true;
      }

      if (currentAgeWeeks >= 12 && leptoCount === 0) {
        currentVaccines.push('Leptospirosis #1');
        leptoCount++;
      } else if (leptoCount === 1) {
        currentVaccines.push('Leptospirosis #2');
        leptoCount++;
      }

      currentVisitDate = skipWeekend(currentVisitDate);

      visits.push({
        id: `v${index + 2}`,
        targetDate: currentVisitDate,
        formattedDate: format(currentVisitDate, 'MM/dd/yyyy (EEEE)'),
        vaccines: currentVaccines,
        notes: isFinalVisit ? 'Final puppy boosters.' : '',
        isBooster: true,
        ageDisplay: `${currentAgeWeeks} Weeks`
      });
    });

    // Canine Spay/Neuter Recommendation
    let sxStart = breedSize === 'Small' ? addMonths(dob, 6) : addMonths(dob, 12);
    let sxEnd = breedSize === 'Small' ? addMonths(dob, 7) : addMonths(dob, 18);
    
    sxStart = skipWeekend(sxStart);
    sxEnd = skipWeekend(sxEnd);

    visits.push({
      id: 'sx',
      targetDate: sxStart,
      formattedDate: `${format(sxStart, 'MM/dd/yyyy')} - ${format(sxEnd, 'MM/dd/yyyy')}`,
      vaccines: [],
      notes: 'Recommended Spay/Neuter timeframe.',
      isBooster: false,
      ageDisplay: breedSize === 'Small' ? '6-7 Months' : '12-18 Months'
    });

  } else if (species === 'Cat') {
    let rabiesGiven = false;
    let felvCount = 0;
    let fvrcpCount = 1;

    // --- VISIT 1 EVALUATION (FELINE) ---
    const initialFelineVaccines = ['FVRCP #1', 'FIV/FeLV Test'];

    if (exactDaysOldAtFirstVisit >= 84) {
      initialFelineVaccines.push('Rabies (1 Yr)', 'FeLV #1');
      rabiesGiven = true;
      felvCount = 1;
    }

    visits.push({
      id: 'v1',
      targetDate: currentVisitDate,
      formattedDate: `Actual: ${format(currentVisitDate, 'MM/dd/yyyy (EEEE)')}`,
      vaccines: initialFelineVaccines,
      notes: 'Initial Visit.',
      isBooster: false,
      ageDisplay: `${currentAgeWeeks} Weeks`
    });

    // --- DYNAMIC INTERVAL CALCULATOR (FELINE) ---
    const intervals: number[] = [];
    let simulatedAge = ageAtFirstVisit;

    while (simulatedAge < 12) {
      const distance = 12 - simulatedAge;
      if (distance <= 2) { 
        intervals.push(2); 
        simulatedAge += 2; 
      } else if (distance === 4) { 
        intervals.push(4); 
        simulatedAge += 4; 
      } else { 
        intervals.push(3); 
        simulatedAge += 3; 
      }
    }

    while (simulatedAge < 16) {
      const distance = 16 - simulatedAge;
      if (distance >= 4) { intervals.push(4); simulatedAge += 4; } 
      else { intervals.push(3); simulatedAge += 3; }
    }

    // --- FELINE BOOSTER GENERATOR ---
    intervals.forEach((intervalWeeks, index) => {
      currentVisitDate = addWeeks(currentVisitDate, intervalWeeks);
      currentAgeWeeks += intervalWeeks;
      fvrcpCount++;

      const isFinalVisit = currentAgeWeeks >= 16;
      const currentVaccines = [`FVRCP #${fvrcpCount}`];

      // Rabies Legal Buffer Logic
      if (currentAgeWeeks >= 12 && !rabiesGiven) {
        const exactDaysOld = differenceInDays(currentVisitDate, dob);
        const earliestArrival = exactDaysOld - 3;
        
        if (earliestArrival < 84) {
          const daysToBuffer = 84 - earliestArrival;
          currentVisitDate = addDays(currentVisitDate, daysToBuffer);
        }

        currentVaccines.push('Rabies (1 Yr)');
        rabiesGiven = true;
      }

      if (currentAgeWeeks >= 12 && felvCount === 0) {
        currentVaccines.push('FeLV #1');
        felvCount++;
      } else if (felvCount === 1) {
        currentVaccines.push('FeLV #2');
        felvCount++;
      }

      currentVisitDate = skipWeekend(currentVisitDate);

      visits.push({
        id: `v${index + 2}`,
        targetDate: currentVisitDate,
        formattedDate: format(currentVisitDate, 'MM/dd/yyyy (EEEE)'),
        vaccines: currentVaccines,
        notes: isFinalVisit ? 'Final kitten boosters.' : '',
        isBooster: true,
        ageDisplay: `${currentAgeWeeks} Weeks`
      });
    });

    // Feline Spay/Neuter Recommendation
    let catSxStart = addMonths(dob, 6);
    let catSxEnd = addMonths(dob, 7);

    catSxStart = skipWeekend(catSxStart);
    catSxEnd = skipWeekend(catSxEnd);

    visits.push({
      id: 'sx',
      targetDate: catSxStart,
      formattedDate: `${format(catSxStart, 'MM/dd/yyyy')} - ${format(catSxEnd, 'MM/dd/yyyy')}`,
      vaccines: [],
      notes: 'Recommended Spay/Neuter timeframe.',
      isBooster: false,
      ageDisplay: '6-7 Months'
    });
  }

  return visits;
}