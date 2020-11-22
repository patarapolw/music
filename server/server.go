package server

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

// Serve starts the server.
// Runs `go func` by default.
func Serve(res *api.Resource) *gin.Engine {
	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("./public", true)))
	res.Register(r)

	port := "8080"
	fmt.Printf("Server running at http://localhost:%s\n", port)
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	return r
}
