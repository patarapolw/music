package db

import (
	"time"

	"gorm.io/gorm"
)

// Entry is a database Model
type Entry struct {
	ID        string `gorm:"primarykey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`

	// Path to the actual file, and attributes
	Path string `gorm:"not null"`
	Size uint   `gorm:"index;not null"`
	Hash string `gorm:"index;not null"`

	// Extracted attributes
	Author    string `gorm:"index"`
	Title     string `gorm:"index;not null"`
	PlainText string
}
