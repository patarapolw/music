-- SQLite
SELECT
  t.name                      title,
  GROUP_CONCAT(f.path, ' | ') paths,
  COUNT(f.path)               reps
FROM title t
INNER JOIN file f ON f.titleId = t.id
GROUP BY title
ORDER BY reps DESC, title ASC;