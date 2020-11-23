-- SQLite
SELECT
  p.name                      author,
  GROUP_CONCAT(f.path, ' | ') paths,
  COUNT(f.path)               reps
FROM person p
INNER JOIN file_authors fa ON fa.personId = p.id
INNER JOIN file f ON fa.fileId = f.id
GROUP BY author
ORDER BY reps DESC, author ASC;