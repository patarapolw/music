package db

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DB is the storage for current DB
type DB struct {
	Current *gorm.DB
}

// Connect connects to DATABASE_URL
func Connect() DB {
	db, err := gorm.Open(sqlite.Open("data.db"), &gorm.Config{})
	if err != nil {
		log.Fatalln(err)
	}

	d := DB{
		Current: db,
	}

	d.Current.AutoMigrate(&Entry{})
	d.initFTS()

	return d
}
