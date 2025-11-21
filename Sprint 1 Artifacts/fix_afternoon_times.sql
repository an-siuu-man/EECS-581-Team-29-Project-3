-- Fix afternoon times: Remove AM and add PM for times between 1:00 and 6:50
-- This corrects times that were incorrectly marked as AM when they should be PM

UPDATE allclasses
SET starttime = REPLACE(starttime, ' AM', '') || ' PM'
WHERE starttime LIKE '%AM'
  AND (
    -- Times 1:00 through 6:50
    (CAST(SPLIT_PART(REPLACE(starttime, ' AM', ''), ':', 1) AS INTEGER) >= 1 
     AND CAST(SPLIT_PART(REPLACE(starttime, ' AM', ''), ':', 1) AS INTEGER) <= 6)
    AND
    -- Exclude times after 6:50 (like 6:55, 7:00, etc.)
    NOT (CAST(SPLIT_PART(REPLACE(starttime, ' AM', ''), ':', 1) AS INTEGER) = 6 
         AND CAST(SPLIT_PART(REPLACE(starttime, ' AM', ''), ':', 2) AS INTEGER) > 50)
  );

-- Verify the changes
SELECT starttime, endtime 
FROM allclasses 
WHERE starttime LIKE '%PM'
ORDER BY CAST(SPLIT_PART(REPLACE(starttime, ' PM', ''), ':', 1) AS INTEGER),
         CAST(SPLIT_PART(REPLACE(starttime, ' PM', ''), ':', 2) AS INTEGER)
LIMIT 50;
