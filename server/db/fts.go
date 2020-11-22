package db

// FTSQuery is full text search virtual table item, for SQLite
type FTSQuery struct {
	EntryID string
	Author  string
	Title   string
	matter  string
	Text    string
}

func (d DB) initFTS() {
	d.Current.Exec(`
	CREATE VIRTUAL TABLE IF NOT EXISTS q USING fts5(
		entry_id	UNINDEXED,
		author,
		title,
		matter,
		[text]
	);
	`)
}

// Search using a string
func (d DB) Search(q string) []FTSQuery {
	var output []FTSQuery

	rows, err := d.Current.Raw("SELECT entry_id, author, title, matter, [text] FROM q(?)", q).Rows()
	if err != nil {
		panic(err)
	}

	for rows.Next() {
		var current *FTSQuery
		err := rows.Scan(&current)
		if err != nil {
			panic(err)
		}

		output = append(output, *current)
	}

	return output
}
