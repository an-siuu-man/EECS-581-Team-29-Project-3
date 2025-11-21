-- Fix starttime column to add AM/PM suffixes based on class schedule logic
-- Classes between 12:00-6:50 are PM (afternoon classes)
-- Classes between 7:00-11:50 are AM (morning classes)

UPDATE allclasses
SET starttime = CASE
  -- If time is 12:00 through 6:50, add PM
  WHEN (CAST(SPLIT_PART(starttime, ':', 1) AS INTEGER) = 12)
    OR (CAST(SPLIT_PART(starttime, ':', 1) AS INTEGER) >= 1 
        AND CAST(SPLIT_PART(starttime, ':', 1) AS INTEGER) <= 6
        AND CAST(SPLIT_PART(starttime, ':', 2) AS INTEGER) <= 50)
    OR (CAST(SPLIT_PART(starttime, ':', 1) AS INTEGER) >= 1 
        AND CAST(SPLIT_PART(starttime, ':', 1) AS INTEGER) < 6)
  THEN 
    starttime || ' PM'
  
  -- If time is 7:00 through 11:50, add AM
  WHEN CAST(SPLIT_PART(starttime, ':', 1) AS INTEGER) >= 7 
    AND CAST(SPLIT_PART(starttime, ':', 1) AS INTEGER) <= 11
    AND CAST(SPLIT_PART(starttime, ':', 2) AS INTEGER) <= 50
  THEN 
    starttime || ' AM'
  
  -- Default: keep as is
  ELSE starttime
END
WHERE starttime NOT LIKE '% AM' 
  AND starttime NOT LIKE '% PM'
  AND starttime != 'APPT';

-- Verify the changes
SELECT starttime, endtime 
FROM allclasses 
ORDER BY starttime 
LIMIT 20;
