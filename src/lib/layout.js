// Assigns column/columnCount to overlapping occurrences on the same day so they can render side-by-side.
export function layoutOccurrences(occurrences) {
  const sorted = [...occurrences].sort((a, b) => a.startMinutes - b.startMinutes);
  const groups = [];
  let currentGroup = [];
  let groupEnd = -Infinity;

  for (const occ of sorted) {
    if (currentGroup.length === 0 || occ.startMinutes < groupEnd) {
      currentGroup.push(occ);
      groupEnd = Math.max(groupEnd, occ.startMinutes + occ.durationMinutes);
    } else {
      groups.push(currentGroup);
      currentGroup = [occ];
      groupEnd = occ.startMinutes + occ.durationMinutes;
    }
  }
  if (currentGroup.length) groups.push(currentGroup);

  const result = [];
  for (const group of groups) {
    const columns = []; // each entry: end time of last item in that column
    const placed = group.map((occ) => {
      let col = columns.findIndex((endTime) => endTime <= occ.startMinutes);
      if (col === -1) {
        col = columns.length;
        columns.push(occ.startMinutes + occ.durationMinutes);
      } else {
        columns[col] = occ.startMinutes + occ.durationMinutes;
      }
      return { ...occ, col };
    });
    const columnCount = columns.length;
    for (const occ of placed) result.push({ ...occ, columnCount });
  }
  return result;
}
